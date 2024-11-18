import { Types } from 'mongoose';
import { DiscountType } from 'src/common/enum/discountType.enum';

export interface IOffer {
  title: string;
  description: string;
  discount_type: DiscountType;
  percentage?: number;
  discount_value?: number;
  expiry_date: Date;
  isActive?: boolean;
  applicable_packages?: Types.ObjectId[];
  agencyId: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}
