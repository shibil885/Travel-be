import { Prop, Schema } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Agency } from '../../agency/schema/agency.schema';
@Schema({ timestamps: true })
export class Package {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Agency' })
  agencyId: Agency;
}
