import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: (origin, callback) => {
      // Izinkan akses lokal (localhost, 127.0.0.1, LAN IP) dan tanpa origin
      if (!origin) return callback(null, true);
      try {
        const hostname = new URL(origin).hostname;
        if (
          hostname === 'localhost' ||
          hostname === '127.0.0.1' ||
          hostname === '0.0.0.0' ||
          hostname.startsWith('192.168.') ||
          hostname.startsWith('10.') ||
          /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname)
        ) {
          return callback(null, true);
        }
      } catch {}
      callback(null, true); // Fallback fleksibel untuk dev lokal
    },
    credentials: true,
  },
  namespace: '/kds',
})
export class KdsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private logger = new Logger(KdsGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join-branch')
  handleJoinBranch(
    @ConnectedSocket() client: Socket,
    payload: { branchId: string },
  ) {
    client.join(`branch-${payload.branchId}`);
    this.logger.log(
      `Client ${client.id} joined branch-${payload.branchId}`,
    );
  }

  emitOrderUpdate(branchId: string, data: any) {
    this.server.to(`branch-${branchId}`).emit('order-update', data);
  }

  emitOrderReady(branchId: string, data: any) {
    this.server.to(`branch-${branchId}`).emit('order-ready', data);
  }
}