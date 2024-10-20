import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type NotificationDocument = Notification & Document;

@Schema({ timestamps: true })
export class Notification {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    refPath: 'from_model',
    required: true,
  })
  from_id: MongooseSchema.Types.ObjectId;

  @Prop({
    type: String,
    required: true,
    enum: ['User', 'Agency', 'Admin     '],
    default: 'User',
  })
  from_model: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    refPath: 'to_model',
    required: true,
  })
  to_id: MongooseSchema.Types.ObjectId;

  @Prop({
    type: String,
    required: true,
    enum: ['User', 'Agency', 'Admin'],
    default: 'User',
  })
  to_model: string;

  @Prop({ required: true, maxlength: 100 })
  title: string;

  @Prop({ required: true, maxlength: 1000 })
  description: string;

  @Prop({ default: false })
  is_read: boolean;

  @Prop({ type: Date, default: null })
  read_at: Date;

  @Prop({
    type: String,
    enum: ['info', 'alert', 'error', 'success'],
    default: 'info',
  })
  type: string;

  @Prop({ type: Number, enum: [1, 2, 3], default: 2 })
  priority: number;

  @Prop({ default: false })
  is_deleted: boolean;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
