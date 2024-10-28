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

  // async createCoupon(couponData: CreateCouponDto) {
  //   const lowerCasedCode = couponData.code.toLocaleLowerCase();
  //   const isExist = await this.CouponModel.findOne({ code: lowerCasedCode });
  //   let createdCoupon;
  //   if (isExist) throw new ConflictException('Coupon code already exist');
  //   const discount_type = couponData.discount_type;
  //   if (discount_type == DiscountType.PERCENTAGE) {
  //     createdCoupon = await new this.CouponModel({
  //       code: lowerCasedCode,
  //       percentage: couponData.percentage,
  //       description: couponData.description,
  //       minAmt: couponData.minAmt,
  //       maxAmt: couponData.maxAmt,
  //       expiry_date: couponData.expiry_date,
  //       discount_type: couponData.discount_type,
  //     }).save();
  //     return createdCoupon;
  //   }
  //   createdCoupon = await new this.CouponModel({
  //     code: lowerCasedCode,
  //     description: couponData.description,
  //     minAmt: couponData.minAmt,
  //     expiry_date: couponData.expiry_date,
  //     discount_type: couponData.discount_type,
  //     discount_value: couponData.discount_value,
  //   }).save();
  //   return createdCoupon;
  // }
  async createCoupon(couponData: CreateCouponDto) {
    const lowerCasedCode = couponData.code.toLowerCase();

    // Check if the coupon already exists
    const isExist = await this.CouponModel.findOne({ code: lowerCasedCode });
    if (isExist) {
      throw new ConflictException('Coupon code already exists');
    }

    // Build the coupon object conditionally based on discount_type
    const couponFields: any = {
      code: lowerCasedCode,
      description: couponData.description,
      minAmt: couponData.minAmt,
      expiry_date: couponData.expiry_date,
      discount_type: couponData.discount_type,
    };

    // Add fields based on discount type
    if (couponData.discount_type === DiscountType.PERCENTAGE) {
      couponFields.percentage = couponData.percentage;
      couponFields.maxAmt = couponData.maxAmt;
    } else if (couponData.discount_type === DiscountType.FIXED) {
      couponFields.discount_value = couponData.discount_value;
    }

    // Save the coupon
    const createdCoupon = await new this.CouponModel(couponFields).save();
    return createdCoupon;
  }

  async editCoupon(id: string, editCouponData: EditCouponDto) {
    const lowerCasedCode = editCouponData.code.toLocaleLowerCase();
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
    if (!isExisting || status == null)
      throw new NotFoundException(
        !isExisting ? 'Coupon not found' : 'Not found any action',
      );
    const updatedCoupon = await this.CouponModel.updateOne(
      { _id: id },
      { isActive: !status },
    );
    return updatedCoupon.modifiedCount > 0 ? true : false;
  }

  async getAllCoupon() {
    const coupons = await this.CouponModel.find({});
    console.log('couponse ---->', coupons);
    console.log('length --->', coupons.length);
    return coupons.length > 0 ? coupons : coupons.length == 0 ? [] : null;
  }
}
