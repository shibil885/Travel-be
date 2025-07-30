import { Types } from 'mongoose';
import { OfferType } from '../constants/enum/offerType.enum';

export interface IOffer {
  title: string;
  description: string;
  discount_type: OfferType;
  percentage?: number;
  discount_value?: number;
  expiry_date: Date;
  isActive?: boolean;
  applicable_packages?: Types.ObjectId[];
  agencyId: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}
