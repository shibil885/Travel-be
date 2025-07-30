import { CouponDocument } from 'src/modules/coupon/schema/coupon.schema';
import { IBaseRepository } from './base/base.interface';

export interface ICouponRepository extends IBaseRepository<CouponDocument> {
  findByCode(code: string): Promise<CouponDocument | null>;
}
