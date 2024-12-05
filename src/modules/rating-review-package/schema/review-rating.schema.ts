import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class ReviewForAgency extends Document {
  @Prop({ type: Types.ObjectId, required: true })
  agencyId: string;

  @Prop([
    {
      userId: { type: Types.ObjectId, required: true },
      rating: { type: String, required: true },
      review: { type: String, required: true },
      created_at: { type: Date, default: Date.now },
    },
  ])
  reviews: Array<{
    userId: Types.ObjectId;
    rating: string;
    review: string;
    created_at: Date;
  }>;

  @Prop({ type: String, required: true })
  averageRating: string;
}

export const ReviewForAgencySchema =
  SchemaFactory.createForClass(ReviewForAgency);
