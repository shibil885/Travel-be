import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type OtpDocument = HydratedDocument<Otp>;

@Schema({ timestamps: true })
export class Otp {
  @Prop({ required: true })
  email: string;
  @Prop({ required: true })
  otp: number;
  @Prop({ type: Date, default: Date.now, expires: '60' })
  time: Date;
}

export const OtpSchema = SchemaFactory.createForClass(Otp);
