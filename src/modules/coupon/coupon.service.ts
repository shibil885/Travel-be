import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Coupon } from './schema/coupon.schema';
import { Model } from 'mongoose';
import {
  CreateCouponDto,
  DiscountType,
} from 'src/common/dtos/createCoupon.gto';
import { EditCouponDto } from 'src/common/dtos/editCoupon.dto';

@Injectable()
export class CouponService {
  constructor(@InjectModel(Coupon.name) private CouponModel: Model<Coupon>) {}

  async createCoupon(couponData: CreateCouponDto) {
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
  }

  async editCoupon(id: string, editCouponData: EditCouponDto) {
    const lowerCasedCode = editCouponData.code;
    const [coupons, isExisting] = await this.CouponModel.aggregate([
      {
        $facet: {
          coupons: [{ $match: { _id: id } }],
          isExisting: [{ $match: { name: lowerCasedCode, _id: { $ne: id } } }],
        },
      },
    ]);
    if (coupons.length == 0) {
      throw new NotFoundException('Category not found');
    } else if (isExisting) {
      throw new ConflictException('Coupon code already exist');
    }
    const editedCouponResponse = await this.CouponModel.updateOne(
      { _id: id },
      editCouponData,
    );
    return editedCouponResponse.modifiedCount > 0 ? true : null;
  }

  async changeStatus(id: string, status: boolean) {
    const isExisting = await this.CouponModel.findById(id);
    if (!isExisting || !status)
      throw new NotFoundException(
        !isExisting ? 'Coupon not found' : 'Not found any action',
      );
    const updatedCoupon = await this.CouponModel.updateOne(
      { _id: id },
      { isActive: status },
    );
    return updatedCoupon.modifiedCount > 0 ? true : false;
  }

  async getAllCoupon() {
    const coupons = await this.CouponModel.find({});
    return coupons.length > 0 ? coupons : coupons.length == 0 ? [] : null;
  }
}
