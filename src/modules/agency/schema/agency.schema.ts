import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type agencyDocument = HydratedDocument<Agency>;

@Schema({ timestamps: true })
export class Agency {
  @Prop({ required: true })
  name: string;
  @Prop({ required: true })
  password: string;
  @Prop(
    raw({
      email: { type: String },
      place: { type: String },
      phone: { type: Number },
      document: { type: String },
    }),
  )
  contact: Record<string, any>;
  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isVerified: boolean;
}

export const AgencySchema = SchemaFactory.createForClass(Agency);
