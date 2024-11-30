import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Message extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Chat', required: true })
  chatId: Types.ObjectId; // Reference to the associated chat

  @Prop({ type: Types.ObjectId, required: true })
  senderId: Types.ObjectId; // ID of the sender (user or agency)

  @Prop({ type: String, enum: ['user', 'agency'], required: true })
  senderType: 'user' | 'agency'; // Type of the sender

  @Prop({
    type: String,
  })
  content?: string; // Text content of the message

  @Prop({
    type: String,
  })
  imageUrl?: string; // URL for an optional image

  @Prop({ default: false })
  isRead: boolean; // Read/unread status of the message
}

export const MessageSchema = SchemaFactory.createForClass(Message);

// Index for optimizing message retrieval within a specific chat
MessageSchema.index({ chatId: 1, createdAt: 1 });

@Schema({ timestamps: true })
export class Chat extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId; // Reference to the user

  @Prop({ type: Types.ObjectId, ref: 'Agency', required: true })
  agencyId: Types.ObjectId; // Reference to the agency

  @Prop({ type: Types.ObjectId, ref: 'Message' })
  lastMessageId?: Types.ObjectId; // Reference to the last message in the chat
}

export const ChatSchema = SchemaFactory.createForClass(Chat);

// Index for optimizing chat queries
ChatSchema.index({ userId: 1, agencyId: 1 });
