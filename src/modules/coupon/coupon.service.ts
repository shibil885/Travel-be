import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Coupon } from './schema/coupon.schema';
import { Model } from 'mongoose';
import {
  CreateCouponDto,
  DiscountType,
} from 'src/common/dtos/createCoupon.gto';

@Injectable()
export class CouponService {
  constructor(@InjectModel(Coupon.name) private CouponModel: Model<Coupon>) {}

  async createCoupon(couponData: CreateCouponDto) {
    try {
      const lowerCasedCode = couponData.code;
      const isExist = await this.CouponModel.findOne({ code: lowerCasedCode });
      let createdCoupon;
      if (isExist) throw new ConflictException('Coupon code already exist');
      const discount_type = couponData.discount_type;
      if (discount_type == DiscountType.PERCENTAGE) {
        return (createdCoupon = await new this.CouponModel({
          code: createdCoupon.code,
          percentage: couponData.percentage,
          description: couponData.description,
          minAmt: couponData.minAmt,
          maxAmt: couponData.maxAmt,
          expiry_date: couponData.expiry_date,
          discount_type: couponData.discount_type,
        }).save());
      }
      return (createdCoupon = await new this.CouponModel({
        code: couponData.code,
        description: couponData.description,
        minAmt: couponData.minAmt,
        expiry_date: couponData.expiry_date,
        discount_type: couponData.discount_type,
        discount_value: couponData.discount_value,
      }));
    } catch (error) {
      console.log('error occured while create new coupon', error);
    }
  }
}
