import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Package {
  @Prop({ required: true })
  name: string;

  @Prop({ type: Types.ObjectId, ref: 'Category', required: true })
  category: Types.ObjectId;

  @Prop({ required: true })
  country: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  departure: string;

  @Prop({ required: true })
  finalDestination: string;

  @Prop({ required: true })
  price: string;

  @Prop({ required: true })
  people: string;

  @Prop({ type: [String], required: true })
  included: string[];

  @Prop({ type: [String], required: true })
  notIncluded: string[];

  @Prop({ required: true })
  days: string;

  @Prop({
    type: [
      {
        day: { type: Number, required: true },
        title: { type: String, required: true },
        description: { type: String, required: true },
      },
    ],
    required: true,
  })
  tourPlans: {
    day: number;
    description: string;
  }[];
  @Prop({ required: true })
  images: string[];
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Agency', required: true })
  agencyId: Types.ObjectId;
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Offer',
    required: true,
    default: null,
  })
  offerId: Types.ObjectId;

  @Prop({ default: true })
  isActive: boolean;
}

export const PackageSchema = SchemaFactory.createForClass(Package);

export type PackageDocument = Package & Document;
