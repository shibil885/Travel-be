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
import { Role } from 'src/common/enum/role.enum';
import { Message } from 'src/modules/chat/schema/chat.schema';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:4200',
    credentials: true,
  },
})
export class SocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private _logger: Logger = new Logger('SocketGateway');
  private _connectedUsers = new Map();
  private _connectedAgencies = new Map();
  private _connectedAdmin = new Map();

  constructor(private _jwt: JwtService) {}

  @WebSocketServer()
  server: Server;

  private _getCookieValue(cookies: string, cookieName: string): string | null {
    const match =
      cookies && cookies.match('(^|;)\\s*' + cookieName + '\\s*=\\s*([^;]+)');
    return match ? match.pop() : null;
  }

  afterInit() {
    this._logger.log('Initialized WebSocket Gateway');
  }

  handleConnection(client: Socket) {
    const cookies = client.request.headers.cookie;
    const token = this._getCookieValue(cookies, 'access_token');
    if (token) {
      try {
        const decoded = this._jwt.verify(token);
        const userId = decoded.sub;
        this._connectedUsers.set(userId, client.id);
        this._logger.log(
          `Client ${userId} connected with client-id: ${client.id}`,
        );
      } catch (error) {
        console.error('Invalid token:', error.message);
        client.disconnect();
      }
    } else {
      console.log('No token found in cookies');
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this._logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinRoom')
  private _handleJoinsRooms(client: Socket, chats: string[]) {
    for (let i = 0; i < chats.length; i++) {
      client.join(chats[i]);
    }
    this._logger.log(`Client ${client.id} joined to rooms: ${chats}`);
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

  @SubscribeMessage('userLoged')
  handleUserLogin(client: Socket, userId: string) {
    this._connectedUsers.set(userId, client.id);
  }
  @SubscribeMessage('agencyLoged')
  handleAgencyLogin(client: Socket, userId: string) {
    this._connectedAgencies.set(userId, client.id);
  }
  @SubscribeMessage('adminLoged')
  handleAdminLogin(client: Socket, userId: string) {
    this._connectedAdmin.set(userId, client.id);
  }

  bookingConfirmed(userId: string) {
    const clientId = this._connectedUsers.get(userId);
    console.log(clientId);
    return this.server.to(clientId).emit('bookingConfirmed');
  }

  bookingCancelled(userId: string) {
    const clientId = this._connectedUsers.get(userId);
    console.log(clientId);
    return this.server.to(clientId).emit('bookingCancelled');
  }

  userBookedNewPackage(agencyId: string, adminId: string) {
    const agencyClientId = this._connectedAgencies.get(agencyId);
    const adminClientId = this._connectedAdmin.get(adminId);
    this.server.to(agencyClientId).emit('userBookedNewPackage');
    this.server.to(adminClientId).emit('userBookedNewPackage');
  }
}
