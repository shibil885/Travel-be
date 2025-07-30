import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from 'src/repositories/base/base.repository';
import { Coupon, CouponDocument } from '../schema/coupon.schema';
import { ICouponRepository } from 'src/repositories/coupon.interface';

@Injectable()
export class CouponRepository
  extends BaseRepository<CouponDocument>
  implements ICouponRepository
{
  constructor(
    @InjectModel(Coupon.name)
    private readonly couponModel: Model<CouponDocument>,
  ) {
    super(couponModel);
  }

  async findByCode(code: string): Promise<CouponDocument | null> {
    return this.couponModel.findOne({ code }).exec();
  }
}
