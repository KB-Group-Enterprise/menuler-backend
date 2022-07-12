import { Logger } from '@nestjs/common';
import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { JoinOrLeaveTable } from './dto/JoinTable.dto';
import { TableService } from './table.service';

@WebSocketGateway(3505, { namespace: 'table' })
export class TableGateWay
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  logger = new Logger('TableGateway');
  @WebSocketServer()
  server: Server;

  constructor(private tableService: TableService) {}

  afterInit(server: any) {
    this.logger.log('TableGateWay Init');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinTable')
  async handleJoinTable(
    @MessageBody() event: JoinOrLeaveTable,
    @ConnectedSocket() client: Socket,
  ): Promise<WsResponse<any>> {
    try {
      const table = await this.tableService.findTableByTableToken(
        event.tableToken,
      );
      if (!table) throw new Error('No table');
      client.data.username = event.username;
      client.join(table.id);
      const sockets = await this.server.in(table.id).fetchSockets();
      const allUser = sockets.map(async (user) => {
        return user.data.username;
      });

      this.server.to(table.id).emit('noti-table', { usersInRoom: allUser });

      return {
        event: 'joinedTable',
        data: {
          // allUser:
          clientId: client.id,
          message: `${event.username} joined`,
        },
      };
    } catch (error) {
      this.logger.error(error);
      return { event: 'error', data: error.message };
    }
  }
  // handleLeaveTable(@MessageBody() event: JoinOrLeaveTable);
}
