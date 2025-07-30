// import {
//   ConflictException,
//   Injectable,
//   NotFoundException,
// } from '@nestjs/common';
// import { InjectModel } from '@nestjs/mongoose';
// import { Coupon } from './schema/coupon.schema';
// import { Model, Types } from 'mongoose';
// import {
//   CreateCouponDto,
//   DiscountType,
// } from 'src/common/dtos/createCoupon.gto';
// import { EditCouponDto } from 'src/common/dtos/editCoupon.dto';
// import { Package } from '../package/schema/package.schema';
// import { IOffer } from 'src/common/interfaces/offer.interface';
// import { CouponFields } from 'src/common/interfaces/couponFields.interface';

// @Injectable()
// export class CouponService {
//   constructor(
//     @InjectModel(Coupon.name) private CouponModel: Model<Coupon>,
//     @InjectModel(Package.name) private PackageModel: Model<Package>,
//   ) {}

//   async createCoupon(couponData: CreateCouponDto) {
//     const lowerCasedCode = couponData.code.toLowerCase();
//     const isExist = await this.CouponModel.findOne({ code: lowerCasedCode });
//     if (isExist) {
//       throw new ConflictException('Coupon code already exists');
//     }
//     const couponFields: CouponFields = {
//       code: lowerCasedCode,
//       description: couponData.description,
//       minAmt: couponData.minAmt,
//       expiry_date: couponData.expiry_date,
//       discount_type: couponData.discount_type,
//     };
//     if (couponData.discount_type === DiscountType.PERCENTAGE) {
//       couponFields.percentage = couponData.percentage;
//       couponFields.maxAmt = couponData.maxAmt;
//     } else if (couponData.discount_type === DiscountType.FIXED) {
//       couponFields.discount_value = couponData.discount_value;
//     }
//     const createdCoupon = await new this.CouponModel(couponFields).save();
//     return createdCoupon;
//   }

//   async editCoupon(
//     id: string,
//     editCouponData: EditCouponDto,
//   ): Promise<boolean> {
//     const lowerCasedCode = editCouponData.code.toLocaleLowerCase();
//     const [fetchResult] = await this.CouponModel.aggregate([
//       {
//         $facet: {
//           coupons: [{ $match: { _id: new Types.ObjectId(id) } }],
//           isExisting: [
//             {
//               $match: {
//                 code: lowerCasedCode,
//                 _id: { $ne: new Types.ObjectId(id) },
//               },
//             },
//           ],
//         },
//       },
//     ]);
//     const { coupons, isExisting } = fetchResult;
//     if (!coupons || coupons.length === 0) {
//       throw new NotFoundException('Coupon not found');
//     }
//     if (isExisting && isExisting.length > 0) {
//       throw new ConflictException('Coupon code already exists');
//     }
//     const updateResult = await this.CouponModel.updateOne(
//       { _id: id },
//       { $set: editCouponData },
//     );
//     return updateResult.modifiedCount > 0;
//   }

//   async changeStatus(id: string, status: boolean) {
//     const isExisting = await this.CouponModel.findById(id);
//     if (!isExisting || status == null)
//       throw new NotFoundException(
//         !isExisting ? 'Coupon not found' : 'Not found any action',
//       );
//     const updatedCoupon = await this.CouponModel.updateOne(
//       { _id: id },
//       { isActive: !status },
//     );
//     return updatedCoupon.modifiedCount > 0 ? true : false;
//   }

//   async getAllCoupon(page: number, limit: number) {
//     const skip = (page - 1) * limit;
//     const [coupons, couponsCount] = await Promise.all([
//       this.CouponModel.find({}).skip(skip).limit(limit),
//       this.CouponModel.countDocuments(),
//     ]);
//     return {
//       coupons,
//       couponsCount,
//       page,
//     };
//   }

//   async getAllCouponsForUser(packageId: string, userId: string) {
//     if (!packageId || !userId) {
//       throw new NotFoundException(
//         !packageId ? 'Cant find package id' : 'Cant find userId',
//       );
//     }
//     const selectedPackage = await this.PackageModel.findOne({
//       _id: packageId,
//       isActive: true,
//     }).populate('offerId');
//     if (!selectedPackage) throw new NotFoundException('Package not found');
//     let amount =
//       Number(selectedPackage.price) + Number(process.env.SERVICE_CHARGE);
//     if (selectedPackage.offerId) {
//       const offer = selectedPackage.offerId as IOffer;
//       if (offer.discount_type === DiscountType.FIXED) {
//         amount = amount - offer.discount_value;
//       } else if (offer.discount_type === DiscountType.PERCENTAGE) {
//         amount = amount * (offer.percentage / 100);
//       }
//     }
//     const couponsForUser = await this.CouponModel.find({
//       minAmt: { $lte: amount },
//       used: { $ne: userId },
//       isActive: true,
//     });
//     return couponsForUser;
//   }
// }

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import {
  CreateCouponDto,
  DiscountType,
} from 'src/common/dtos/createCoupon.gto';
import { ICouponRepository } from 'src/repositories/coupon.interface';
import { CouponDocument } from './schema/coupon.schema';
import { EditCouponDto } from 'src/common/dtos/editCoupon.dto';
import { IPackageRepository } from 'src/repositories/package/package.repository';
import { IOffer } from 'src/common/interfaces/offer.interface';

@Injectable()
export class CouponService {
  constructor(
    @Inject('ICouponRepository')
    private readonly _couponRepository: ICouponRepository,
    @Inject('IPackageRepository')
    private readonly _packageRepository: IPackageRepository,
  ) {}

  async createCoupon(dto: CreateCouponDto): Promise<CouponDocument> {
    const existing = await this._couponRepository.findByCode(dto.code);
    if (existing) throw new BadRequestException('Coupon already exists');
    return this._couponRepository.create(dto);
  }

  async getAllCoupons(page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [coupons, totalCount] = await Promise.all([
      this._couponRepository.findAllWithPaginationAndFilter({}, skip, limit),
      this._couponRepository.countDocument({}),
    ]);
    if (!totalCount) {
      throw new NotFoundException('No coupons available');
    }
    return {
      coupons,
      totalCount,
      currentPage: page,
    };
  }

  async getCouponById(id: string): Promise<CouponDocument> {
    const coupon = await this._couponRepository.findById(id);
    if (!coupon) throw new NotFoundException('Coupon not found');
    return coupon;
  }

  async updateCoupon(id: string, dto: EditCouponDto): Promise<CouponDocument> {
    const updated = await this._couponRepository.update(id, dto);
    if (!updated) throw new NotFoundException('Coupon not found');
    return updated;
  }
  async updateCouponStatus(
    id: string,
    status: boolean,
  ): Promise<CouponDocument> {
    const updated = await this._couponRepository.update(id, {
      isActive: status,
    });
    if (!updated) throw new NotFoundException('Coupon not found');
    return updated;
  }

  async deleteCoupon(id: string): Promise<CouponDocument> {
    const deleted = await this._couponRepository.delete(id);
    if (!deleted) throw new NotFoundException('Coupon not found');
    return deleted;
  }

  async getCouponForSelectedPackage(packageId: string, userId: string) {
    if (!packageId || !userId) {
      throw new NotFoundException(
        !packageId ? 'Cant find package id' : 'Cant find userId',
      );
    }

    const selectedPackage =
      await this._packageRepository.findOnePackageWithOffer(packageId);
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
    const couponsForUser = await this._couponRepository.findAll({
      minAmt: { $lte: amount },
      used: { $ne: userId },
      isActive: true,
    });
    return { coupons: couponsForUser };
  }
}
