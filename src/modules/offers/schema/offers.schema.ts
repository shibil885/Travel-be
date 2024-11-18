import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { DiscountType } from 'src/common/enum/discountType.enum';
import { OfferType } from 'src/common/enum/offerType.enum';

@Schema({ timestamps: true })
export class Offer extends Document {
  @Prop({ type: String, required: true })
  title: string; // Name of the offer (e.g., "Summer Sale", "Early Bird Offer")

  @Prop({ type: String, required: true })
  description: string; // Details about the offer

  @Prop({ type: String, enum: DiscountType, required: true })
  discount_type: OfferType; // Type of discount: percentage or fixed amount

  @Prop({ type: Number })
  percentage: number; // Value of the discount (percentage or fixed)

  @Prop({ type: Number })
  discount_value: number; // Value of the discount (percentage or fixed)

  @Prop({ type: Date, required: true })
  expiry_date: Date; // End date of the offer

  @Prop({ type: Boolean, default: true })
  isActive: boolean; // Status of the offer

  @Prop({ type: [Types.ObjectId], ref: 'Package', default: [] })
  applicable_packages: Types.ObjectId[]; // List of packages this offer applies to

  @Prop({ type: Types.ObjectId, ref: 'Agency', required: true })
  agencyId: Types.ObjectId;
}

export const OfferSchema = SchemaFactory.createForClass(Offer);
