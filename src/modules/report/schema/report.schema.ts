import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ReportDocument = Report & Document;

@Schema({ timestamps: true })
export class Report {
  @Prop({ type: Types.ObjectId, required: true, ref: 'User' })
  reportedBy: Types.ObjectId;

  @Prop({
    type: String,
    required: true,
    enum: ['Agency', 'Package', 'Post', 'Comment'],
  })
  targetType: string;

  @Prop({ type: Types.ObjectId, required: true })
  targetId: Types.ObjectId;

  @Prop({ type: String, required: true })
  reason: string;

  @Prop({ type: String })
  description: string;

  @Prop({
    type: String,
    enum: ['pending', 'reviewed', 'resolved'],
    default: 'pending',
  })
  status: string;

  @Prop({ type: String })
  reviewComment?: string;

  @Prop({ type: Date })
  resolvedAt?: Date;
}

export const ReportSchema = SchemaFactory.createForClass(Report);
