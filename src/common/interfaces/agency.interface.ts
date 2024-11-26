import { Types } from 'mongoose';
export interface IAgency {
  _id: Types.ObjectId;
  name: string;
  email: string;
  place: string;
  phone: number;
  document: string;
  password: string;
  isActive: boolean;
  isVerified: boolean;
  isConfirmed: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
