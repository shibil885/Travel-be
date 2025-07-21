import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import Razorpay from 'razorpay';
import { Package } from '../package/schema/package.schema';
import { Model } from 'mongoose';
import { Coupon } from '../coupon/schema/coupon.schema';
import * as crypto from 'crypto';
import { IOffer } from 'src/common/interfaces/offer.interface';
import { DiscountType } from 'src/common/enum/discountType.enum';
@Injectable()
export class PaymentService {
  private razorpay: Razorpay;

  constructor(
    @InjectModel(Package.name) private PackageModel: Model<Package>,
    @InjectModel(Coupon.name) private CouponModel: Model<Coupon>,
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
    const selectedPackage = await this.PackageModel.findOne({
      _id: packageId,
      isActive: true,
    }).populate('offerId');
    if (!selectedPackage.price)
      throw new NotFoundException('Cant find package');
    amount = Number(selectedPackage.price);
    if (selectedPackage.offerId) {
      const offer = selectedPackage.offerId as IOffer;
      if (offer.discount_type === DiscountType.FIXED) {
        amount = amount - offer.discount_value;
      } else if (offer.discount_type === DiscountType.PERCENTAGE) {
        amount = amount * (offer.percentage / 100);
      }
    }
    if (couponId) {
      const selectedCoupon = await this.CouponModel.findOne({
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
