import { Types } from 'mongoose';
export interface IUser {
  _id: Types.ObjectId;
  email: string;
  username: string;
  password: string;
  isActive: boolean;
  isVerified: boolean;
  phone: string;
  profilePicture?: string;
  address: string;
  preferences: string[];
  createdAt: Date;
  updatedAt: Date;
}
