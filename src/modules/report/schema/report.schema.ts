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
    enum: ['agency', 'package', 'post', 'comment'],
  })
  targetType: string;

  @Prop({ type: Types.ObjectId, required: true })
  targetId: Types.ObjectId;

  @Prop({ type: String, required: true })
  reason: string; // Reason for the report (e.g., spam, abuse)

  @Prop({ type: String })
  description: string; // Additional details provided by the user

  @Prop({
    type: String,
    enum: ['pending', 'reviewed', 'resolved'],
    default: 'pending',
  })
  status: string; // Status of the report

  @Prop({ type: Types.ObjectId, ref: 'User' })
  reviewedBy?: Types.ObjectId; // Admin who reviewed the report

  @Prop({ type: String })
  reviewComment?: string; // Admin's comment on the resolution

  @Prop({ type: Date })
  resolvedAt?: Date; // Timestamp of resolution
}

export const ReportSchema = SchemaFactory.createForClass(Report);
