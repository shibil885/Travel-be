import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import * as mongoose from 'mongoose';

export type PostDocument = HydratedDocument<Post>;

@Schema({ timestamps: true })
export class Post {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  userId: mongoose.Types.ObjectId;

  @Prop({ type: String, required: true })
  imageUrl: string;

  @Prop({ type: String, required: true })
  caption: string;

  @Prop([
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      createdAt: { type: Date, default: Date.now },
    },
  ])
  likes: Array<{ userId: mongoose.Types.ObjectId; createdAt: Date }>;

  @Prop([
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      comment: { type: String, required: true },
      createdAt: { type: Date, default: Date.now },
    },
  ])
  comments: Array<{
    userId: mongoose.Types.ObjectId;
    comment: string;
    createdAt: Date;
  }>;

  @Prop({ type: String, enum: ['public', 'private'], default: 'public' })
  visibility: string;

  @Prop({ type: Boolean, default: false })
  deleted: boolean;
}

export const PostSchema = SchemaFactory.createForClass(Post);
