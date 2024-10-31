import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Booking extends Document {
  @Prop({ required: true, type: mongoose.Types.ObjectId, ref: 'User' })
  user_id: string;

  @Prop({ required: true, type: mongoose.Types.ObjectId, ref: 'Package' })
  package_id: string;

  @Prop({ required: true, type: mongoose.Types.ObjectId, ref: 'Agency' })
  agency_id: string;

  @Prop({ required: true })
  payment: string;

  @Prop({ required: true })
  start_date: Date;

  @Prop({ required: true })
  end_date: Date;

  @Prop({ required: true })
  travel_status: string;

  @Prop({ required: true })
  confirmation: boolean;

  @Prop({ type: mongoose.Types.ObjectId, ref: 'Coupon' })
  coupon_id: string;

  @Prop({ required: true })
  discounted_price: string;

  @Prop({ required: true })
  total_price: string;

  @Prop({
    type: [
      {
        name: { type: String, required: true },
        age: { type: String, required: true },
      },
    ],
    required: true,
  })
  peoples: { name: string; age: string }[];

  @Prop({
    type: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
    },
    required: true,
  })
  billing_details: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
}

export const BookingSchema = SchemaFactory.createForClass(Booking);
