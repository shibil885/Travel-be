import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import Razorpay from 'razorpay';
import { Package } from '../package/schema/package.schema';
import { Model } from 'mongoose';
import { Coupon } from '../coupon/schema/coupon.schema';
import * as crypto from 'crypto';
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
    const { price } = await this.PackageModel.findOne(
      {
        _id: packageId,
        isActive: true,
      },
      { price: 1 },
    );
    if (!price) throw new NotFoundException('Cant find package');
    if (couponId) {
      const selectedCoupon = await this.CouponModel.findOne({
        _id: couponId,
        minAmt: { $lte: price },
        used: { $ne: userId },
        isActive: true,
      });
      if (!selectedCoupon) throw new NotFoundException('Cant find coupon');
      if (selectedCoupon.discount_type == 'fixed') {
        amount = Number(price) - selectedCoupon.discount_value;
      } else if (selectedCoupon.discount_type == 'percentage') {
        const discount = (Number(price) * selectedCoupon.percentage) / 100;
        if (discount > selectedCoupon.maxAmt) {
          amount = Number(price) - discount;
        } else {
          amount = Number(price) - discount;
        }
      }
    }
    const options = {
      amount: amount ? amount * 100 : Number(price) * 100,
      currency,
      receipt: `receipt_${Math.random()}`,
    };
    try {
      const order = await this.razorpay.orders.create(options);
      console.log('payment created--->', order);
      return order;
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
