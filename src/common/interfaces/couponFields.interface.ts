import { DiscountType } from '../constants/enum/discountType.enum';

export interface CouponFields {
  code: string;
  description: string;
  minAmt?: number;
  expiry_date: Date;
  discount_type: DiscountType;
  percentage?: number;
  maxAmt?: number;
  discount_value?: number;
}
