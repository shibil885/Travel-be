import { ObjectId } from 'mongoose';
import { IOffer } from './offer.interface';

interface TourPlan {
  day: number;
  title: string;
  description: string;
}

export interface IPackage {
  _id?: ObjectId;
  agencyId: ObjectId;
  name: string;
  category: ObjectId;
  country: string;
  description: string;
  departure: string;
  finalDestination: string;
  price: string;
  people: string;
  included: string[];
  notIncluded: string[];
  days: string;
  tourPlans: TourPlan[];
  images: string[];
  offerId: IOffer;
  isActive: boolean;
}
