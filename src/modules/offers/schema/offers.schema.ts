import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';
import { OfferType } from 'src/common/constants/enum/offerType.enum';
export type OfferDocument = HydratedDocument<Offer>;
@Schema({ timestamps: true })
export class Offer extends Document {
  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: String, required: true })
  description: string;

  @Prop({ type: String, enum: OfferType, required: true })
  discount_type: OfferType;

  @Prop({ type: Number })
  percentage: number;

  @Prop({ type: Number })
  discount_value: number;

  @Prop({ type: Date, required: true })
  expiry_date: Date;

  @Prop({ type: Boolean, default: true })
  isActive: boolean;

  @Prop({ type: [Types.ObjectId], ref: 'Package', default: [] })
  applicable_packages: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, ref: 'Agency', required: true })
  agencyId: Types.ObjectId;
}

export const OfferSchema = SchemaFactory.createForClass(Offer);
