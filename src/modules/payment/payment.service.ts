import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import Razorpay from 'razorpay';
import * as crypto from 'crypto';
import { IOffer } from 'src/common/interfaces/offer.interface';
import { DiscountType } from 'src/common/constants/enum/discountType.enum';
import { IPackageRepository } from 'src/repositories/package/package.repository';
import { ICouponRepository } from 'src/repositories/coupon/coupon.interface';
import { OfferType } from 'src/common/constants/enum/offerType.enum';
@Injectable()
export class PaymentService {
  private razorpay: Razorpay;

  constructor(
    @Inject('IPackageRepository')
    private readonly _packageRepository: IPackageRepository,
    @Inject('ICouponRepository')
    private readonly _couponRepository: ICouponRepository,
  ) {
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }

  async createOrder(
    userId: string,
    packageId: string,
    couponId: string,
    currency: string = 'INR',
  ) {
    if (!packageId) throw new NotFoundException('Cant find packageId');
    let amount: number;
    const selectedPackage =
      await this._packageRepository.findOnePackageWithOffer(packageId);
    if (!selectedPackage.price)
      throw new NotFoundException('Cant find package');
    amount = Number(selectedPackage.price);
    console.log('selectedPackage.offerId', selectedPackage.offerId);
    if (selectedPackage.offerId) {
      const offer = selectedPackage.offerId as IOffer;
      if (offer.discount_type === OfferType.FIXED) {
        amount = amount - offer.discount_value;
      } else if (offer.discount_type === OfferType.PERCENTAGE) {
        amount = amount * (offer.percentage / 100);
      }
    }
    if (couponId) {
      const selectedCoupon = await this._couponRepository.findOne({
        _id: couponId,
        minAmt: { $lte: amount },
        used: { $ne: userId },
        isActive: true,
      });
      if (!selectedCoupon) throw new NotFoundException('Cant find coupon');
      if (selectedCoupon.discount_type == DiscountType.FIXED) {
        amount = amount - selectedCoupon.discount_value;
      } else if (selectedCoupon.discount_type == DiscountType.PERCENTAGE) {
        const discount = amount * (selectedCoupon.percentage / 100);
        if (discount > selectedCoupon.maxAmt) {
          amount = amount - selectedCoupon.maxAmt;
        } else {
          amount = amount - discount;
        }
      }
    }
    if (amount <= 50) {
      amount = 50;
    }
    const options = {
      amount: amount ? amount * 100 : 50 * 100,
      currency,
      receipt: `receipt_${Math.random()}`,
    };
    try {
      const order = await this.razorpay.orders.create(options);
      return { ...order, key_id: process.env.RAZORPAY_KEY_SECRET };
    } catch (error) {
      console.log('Error occured while creating order', error);
      throw new Error(`Error creating order: ${error.message}`);
    }
  }

  verifySignature(
    paymentId: string,
    orderId: string,
    signature: string,
  ): boolean {
    const body = `${orderId}|${paymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');
    return expectedSignature === signature;
  }
}
