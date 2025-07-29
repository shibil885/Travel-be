import { Types } from 'mongoose';
import { DiscountType } from '../constants/enum/discountType.enum';

export interface ICoupon {
  code: string;
  percentage?: number;
  description: string;
  minAmt: number;
  maxAmt?: number;
  expiry_date: Date;
  isActive: boolean;
  used: Types.ObjectId[];
  discount_type?: DiscountType;
  discount_value?: number;
  createdAt?: Date;
  updatedAt?: Date;
}
