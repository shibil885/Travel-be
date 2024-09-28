import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  email: string;
  @Prop({ required: true })
  password: string;
  @Prop(
    raw({
      profilePicture: { type: String },
      phone: { type: Number },
      address: { type: String },
      preferences: { type: [String] },
    }),
  )
  profile: Record<string, any>;
  @Prop({ default: true })
  is_Active: boolean;
  @Prop({ default: false })
  is_Verified: boolean;
}
export const UserSchema = SchemaFactory.createForClass(User);
