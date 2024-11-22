import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Coupon } from './schema/coupon.schema';
import { Model, Types } from 'mongoose';
import {
  CreateCouponDto,
  DiscountType,
} from 'src/common/dtos/createCoupon.gto';
import { EditCouponDto } from 'src/common/dtos/editCoupon.dto';
import { Package } from '../package/schema/package.schema';
import { IOffer } from 'src/common/interfaces/offer.interface';

@Injectable()
export class CouponService {
  constructor(
    @InjectModel(Coupon.name) private CouponModel: Model<Coupon>,
    @InjectModel(Package.name) private PackageModel: Model<Package>,
  ) {}

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
    const isExist = await this.CouponModel.findOne({ code: lowerCasedCode });
    if (isExist) {
      throw new ConflictException('Coupon code already exists');
    }
    const couponFields: any = {
      code: lowerCasedCode,
      description: couponData.description,
      minAmt: couponData.minAmt,
      expiry_date: couponData.expiry_date,
      discount_type: couponData.discount_type,
    };
    if (couponData.discount_type === DiscountType.PERCENTAGE) {
      couponFields.percentage = couponData.percentage;
      couponFields.maxAmt = couponData.maxAmt;
    } else if (couponData.discount_type === DiscountType.FIXED) {
      couponFields.discount_value = couponData.discount_value;
    }
    const createdCoupon = await new this.CouponModel(couponFields).save();
    return createdCoupon;
  }

  // async editCoupon(id: string, editCouponData: EditCouponDto) {
  //   const lowerCasedCode = editCouponData.code.toLocaleLowerCase();
  //   const [coupons, isExisting] = await this.CouponModel.aggregate([
  //     {
  //       $facet: {
  //         coupons: [{ $match: { _id: id } }],
  //         isExisting: [{ $match: { name: lowerCasedCode, _id: { $ne: id } } }],
  //       },
  //     },
  //   ]);
  //   console.log('cou -->', coupons);
  //   console.log('isexi -->', isExisting);
  //   if (coupons.length == 0) {
  //     throw new NotFoundException('Coupon not found');
  //   } else if (isExisting) {
  //     throw new ConflictException('Coupon code already exist');
  //   }
  //   const editedCouponResponse = await this.CouponModel.updateOne(
  //     { _id: id },
  //     editCouponData,
  //   );
  //   return editedCouponResponse.modifiedCount > 0 ? true : null;
  // }
  async editCoupon(
    id: string,
    editCouponData: EditCouponDto,
  ): Promise<boolean> {
    const lowerCasedCode = editCouponData.code.toLocaleLowerCase();
    const [fetchResult] = await this.CouponModel.aggregate([
      {
        $facet: {
          coupons: [{ $match: { _id: new Types.ObjectId(id) } }],
          isExisting: [
            {
              $match: {
                code: lowerCasedCode,
                _id: { $ne: new Types.ObjectId(id) },
              },
            },
          ],
        },
      },
    ]);
    const { coupons, isExisting } = fetchResult;
    if (!coupons || coupons.length === 0) {
      throw new NotFoundException('Coupon not found');
    }
    if (isExisting && isExisting.length > 0) {
      throw new ConflictException('Coupon code already exists');
    }
    const updateResult = await this.CouponModel.updateOne(
      { _id: id },
      { $set: editCouponData },
    );
    return updateResult.modifiedCount > 0;
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

  async getAllCoupon(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [coupons, couponsCount] = await Promise.all([
      this.CouponModel.find({}).skip(skip).limit(limit),
      this.CouponModel.countDocuments(),
    ]);
    return {
      coupons,
      couponsCount,
      page,
    };
  }

  async getAllCouponsForUser(packageId: string, userId: string) {
    if (!packageId || !userId) {
      throw new NotFoundException(
        !packageId ? 'Cant find package id' : 'Cant find userId',
      );
    }
    const selectedPackage = await this.PackageModel.findOne({
      _id: packageId,
      isActive: true,
    }).populate('offerId');
    if (!selectedPackage) throw new NotFoundException('Package not found');
    let amount =
      Number(selectedPackage.price) + Number(process.env.SERVICE_CHARGE);
    if (selectedPackage.offerId) {
      const offer = selectedPackage.offerId as IOffer;
      if (offer.discount_type === DiscountType.FIXED) {
        amount = amount - offer.discount_value;
      } else if (offer.discount_type === DiscountType.PERCENTAGE) {
        amount = amount * (offer.percentage / 100);
      }
    }
    const couponsForUser = await this.CouponModel.find({
      minAmt: { $lte: amount },
      used: { $ne: userId },
      isActive: true,
    });
    return couponsForUser;
  }
}
