import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: { origin: process.env.FRONTEND_URL, credentials: true },
  namespace: '/notifications',
})

export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer()

  server!: Server;

  private logger = new Logger('NotificationsGateway');
  private userSockets = new Map<string, Set<string>>();
  constructor(private jwtService: JwtService) {}


  async handleConnection(client: Socket) {
  try {
    const token = client.handshake.auth?.token as string;
    if (!token) throw new Error('No token provided');
    const payload = await this.jwtService.verifyAsync(token, {
      secret: process.env.JWT_ACCESS_SECRET,
    });
    const userId = payload.sub;
    client.data.userId = userId;
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId)!.add(client.id);
    client.join(`user:${userId}`);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    this.logger.warn(`Rejected socket connection: ${message}`);
    client.disconnect();
  }
}
  


handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    if (userId && this.userSockets.has(userId)) {
      this.userSockets.get(userId)!.delete(client.id);
      if (this.userSockets.get(userId)!.size === 0) {
        this.userSockets.delete(userId);
      }
    }
  }


  sendToUser(userId: string, notification: any) {
    this.server.to(`user:${userId}`).emit('notification', notification);
  }



  sendUpdateToUser(userId:string,notification:any){
    this.server.to(`user:${userId}`).emit('notification:update',notification)
  }
  
}