import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { TravelConfirmationStatus } from 'src/common/enum/travelConfirmation.enum';
import { TravelStatus } from 'src/common/enum/travelStatus.enum';

@Schema({ timestamps: true })
export class Booking extends Document {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  user_id: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Package' })
  package_id: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Agency' })
  agency_id: Types.ObjectId;

  @Prop({ required: true })
  payment: string;

  @Prop({ required: true })
  start_date: Date;

  @Prop({ required: true })
  end_date: Date;

  @Prop({
    required: true,
    type: String,
    enum: Object.values(TravelStatus),
    default: TravelStatus.PENDING,
  })
  travel_status: TravelStatus;

  @Prop({
    required: true,
    type: String,
    enum: Object.values(TravelConfirmationStatus),
    default: TravelConfirmationStatus.PENDING,
  })
  confirmation: TravelConfirmationStatus;

  @Prop({ type: Types.ObjectId, ref: 'Coupon' })
  coupon_id: Types.ObjectId;

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
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);
