import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { TransactionType } from 'src/common/enum/transactionType.enum';

@Schema({ timestamps: true })
export class Transaction {
  @Prop({ type: Number, required: true })
  amount: number;

  @Prop({ type: String, required: true })
  description: string;

  @Prop({
    type: String,
    required: true,
    enum: Object.values(TransactionType),
  })
  type: TransactionType;
}

const TransactionSchema = SchemaFactory.createForClass(Transaction);

@Schema({ timestamps: true })
export class Wallet extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ type: Number, required: true, default: 0, min: 0 })
  balance: number;

  @Prop({ type: [TransactionSchema], default: [] })
  history: Transaction[];
}

export const WalletSchema = SchemaFactory.createForClass(Wallet);
