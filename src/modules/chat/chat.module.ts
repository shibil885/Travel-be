import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Chat, ChatSchema, Message, MessageSchema } from './schema/chat.schema';
import { Agency, AgencySchema } from '../agency/schema/agency.schema';
import { User, UserSchema } from '../user/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Chat.name, schema: ChatSchema },
      { name: Message.name, schema: MessageSchema },
      { name: Agency.name, schema: AgencySchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  providers: [ChatService],
  controllers: [ChatController],
})
export class ChatModule {}
