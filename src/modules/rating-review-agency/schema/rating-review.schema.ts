import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Types } from 'mongoose';

@Schema()
export class ReviewForPackage extends Document {
  @Prop({ type: Types.ObjectId, required: true, ref: 'packages' })
  packageId: string;

  @Prop([
    {
      userId: { type: Types.ObjectId, required: true, ref: 'users' },
      rating: { type: String, required: true },
      review: { type: String, required: true },
      created_at: { type: Date, default: Date.now },
    },
  ])
  reviews: Array<{
    userId: Types.ObjectId;
    rating: number;
    review: string;
    created_at: Date;
  }>;

  @Prop({ type: String, required: true })
  averageRating: string;
}

export const ReviewForPackageSchema =
  SchemaFactory.createForClass(ReviewForPackage);
