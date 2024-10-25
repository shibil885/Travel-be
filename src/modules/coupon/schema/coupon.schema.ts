import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Coupon extends Document {
  @Prop({ type: String, required: true })
  code: string;

  @Prop({ type: Number })
  percentage: number;

  @Prop({ type: String, required: true })
  description: string;

  @Prop({ type: Number, required: true })
  minAmt: number;

  @Prop({ type: Number })
  maxAmt: number;

  @Prop({ type: Date, required: true })
  expiry_date: Date;

  @Prop({ type: Boolean, default: true })
  is_Active: boolean;

  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  used: Types.ObjectId[];

  @Prop({ type: String, enum: ['percentage', 'fixed'] })
  discount_type: string;

  @Prop({ type: Number })
  discount_value: number;
}

export const CouponSchema = SchemaFactory.createForClass(Coupon);
