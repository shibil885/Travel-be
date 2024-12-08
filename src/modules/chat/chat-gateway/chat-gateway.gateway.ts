import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { Message } from '../schema/chat.schema';
import { Role } from 'src/common/enum/role.enum';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:4200',
    credentials: true,
  },
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private logger: Logger = new Logger('ChatGateway');

  @WebSocketServer()
  server: Server;

  afterInit(server: Server) {
    this.logger.log('Initialized WebSocket Gateway', server);
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinRoom')
  handleJoinsRooms(client: Socket, chats: string[]) {
    for (let i = 0; i < chats.length; i++) {
      client.join(chats[i]);
    }
    this.logger.log(`Client ${client.id} joined to rooms: ${chats}`);
  }

  sendMessage(chatId: string, message: Message) {
    return this.server.to(chatId).emit('message', message);
  }

  markAsRead(chatId: string, userType: string) {
    console.log('user type', userType);
    if (userType === Role.AGENCY) {
      return this.server.to(chatId).emit('agencyReadAllMessages', { chatId });
    } else {
      return this.server.to(chatId).emit('userReadAllMessages', { chatId });
    }
  }
}
