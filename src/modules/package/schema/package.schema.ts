import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class TourPlan {
  @Prop({ required: true })
  day: string;

  @Prop({ required: true })
  description: string[];
}

export const TourPlanSchema = SchemaFactory.createForClass(TourPlan);

@Schema({ timestamps: true })
export class Package {
  @Prop({ required: true })
  name: string;

  @Prop({ type: Types.ObjectId, ref: 'Category' })
  category_id: Types.ObjectId;

  @Prop({ required: true })
  country: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  departure_from: string;

  @Prop({ required: true })
  destination: string;

  @Prop({ required: true })
  price: string;

  @Prop({ required: true })
  no_of_people: string;

  @Prop({ type: [String], required: true })
  included: string[];

  @Prop({ type: [String], required: true })
  notIncluded: string[];

  @Prop({ required: true })
  no_of_days: string;

  @Prop({ type: TourPlanSchema, required: true })
  tour_plan: TourPlan[];

  @Prop({ type: [String], required: true })
  images: string[];

  @Prop({ default: true })
  isActive: boolean;
}

export const PackageSchema = SchemaFactory.createForClass(Package);

@Schema({ timestamps: true })
export class Packages {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Agency' })
  agencyId: Types.ObjectId;

  @Prop({ type: [Package], required: true })
  packages: Package[];
}

export const PackagesSchema = SchemaFactory.createForClass(Packages);

export type PackageDocument = Package & Document;
export type PackagesDocument = Packages & Document;
