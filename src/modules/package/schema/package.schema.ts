import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class TourPlans {
  @Prop({ required: true })
  day: number;

  @Prop({ required: true })
  description: string;
}

export const TourPlanSchema = SchemaFactory.createForClass(TourPlans);

@Schema({ timestamps: true })
export class Package {
  @Prop({ required: true })
  name: string;

  @Prop({ type: Types.ObjectId, ref: 'Category' })
  category: Types.ObjectId;

  @Prop({ required: true })
  country: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  departure: string;

  @Prop({ required: true })
  finalDestination: string;

  @Prop()
  price: string;

  @Prop({ required: true })
  people: string;

  @Prop({ type: [String], required: true })
  included: string[];

  @Prop({ type: [String], required: true })
  notIncluded: string[];

  @Prop({ required: true })
  days: string;

  @Prop({ type: [TourPlanSchema], required: true })
  TourPlans: TourPlans[];

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
