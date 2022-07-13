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
import { Table } from '@prisma/client';
import { Socket, Server } from 'socket.io';
import { ClientGroupService } from 'src/client-group/client-group.service';
import { CustomWsResponse } from './dto/CustomWsResponse';
import { JoinOrLeaveTable } from './dto/JoinTable.dto';
import { EVENT_TYPE } from './enums/event-type.enum';
import { TableService } from './table.service';

@WebSocketGateway(3505, { namespace: 'table' })
export class TableGateWay
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  NOTI_TABLE = 'noti-table';
  logger = new Logger('TableGateway');
  @WebSocketServer()
  server: Server;

  constructor(
    private tableService: TableService,
    private clientGroupService: ClientGroupService,
  ) {}

  afterInit(server: Server) {
    this.logger.log('TableGateWay Init');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    client.on('disconnecting', async (reason) => {
      const rooms = this.getRoomsExceptSelf(client);
      this.logger.log(reason);
      for (const room of rooms) {
        const sockets = await this.getCurrentSocketInRoom(room);
        const allUser = sockets
          .map((user) => {
            if (user.id !== client.id)
              return {
                username: user.data.username,
                clientId: user.id,
              };
          })
          .filter((user) => (user ? true : false));
        this.server.to(room).emit(this.NOTI_TABLE, {
          usernameInRoom: allUser,
          message: `${client.data.username} left`,
          type: EVENT_TYPE.LEFT,
        });
      }
    });
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinTable')
  async handleJoinTable(
    @MessageBody() event: JoinOrLeaveTable,
    @ConnectedSocket() client: Socket,
  ): Promise<WsResponse<CustomWsResponse>> {
    try {
      const table = await this.tableService.findTableById(event.tableId);
      if (!table) throw new Error('No table');
      client.data.username = event.username;
      client.data.joinedAt = Date.now();
      client.join(table.id);

      const sockets = await this.getCurrentSocketInRoom(table.id);
      const allUser = sockets.map((user) => ({
        clientId: user.id,
        username: user.data.username,
      }));

      this.server.to(table.id).emit('noti-table', {
        usernameInRoom: allUser,
        message: `${event.username} joined`,
        type: EVENT_TYPE.JOIN,
      });

      return {
        event: 'joinedTable',
        data: {
          clientId: client.id,
          message: `${event.username} joined`,
          type: EVENT_TYPE.JOIN,
        },
      };
    } catch (error) {
      this.logger.error(error);
      return {
        event: 'error',
        data: {
          message: error.message,
          type: EVENT_TYPE.ERROR,
        },
      };
    }
  }

  @SubscribeMessage('leaveTable')
  async handleLeaveTable(
    @MessageBody() event: JoinOrLeaveTable,
    @ConnectedSocket() client: Socket,
  ): Promise<WsResponse<CustomWsResponse>> {
    try {
      client.data.username = event.username;
      client.data.joinedAt = Date.now();
      const rooms = this.getRoomsExceptSelf(client);
      const tableId = rooms.find((room) => room === event.tableId);
      if (!tableId) throw new Error('your tableId is invalid');
      client.leave(event.tableId);

      const sockets = await this.getCurrentSocketInRoom(event.tableId);
      const allUser = sockets.map((user) => ({
        clientId: user.id,
        username: user.data.username,
      }));

      this.server.to(event.tableId).emit('noti-table', {
        usernameInRoom: allUser,
        message: `${event.username} left`,
        type: EVENT_TYPE.LEFT,
      });

      return {
        event: 'leftTable',
        data: {
          clientId: client.id,
          message: `${event.username} left`,
          type: EVENT_TYPE.JOIN,
        },
      };
    } catch (error) {
      return {
        event: 'error',
        data: {
          message: error.message,
          type: EVENT_TYPE.ERROR,
        },
      };
    }
  }

  private async createClientGroup(table: Table, client: Socket) {
    return await this.clientGroupService.createClientGroup({
      table: {
        connect: { id: table.id },
      },
      client: [client.data],
    });
  }

  private async updateClientGroup(clientGroupId: string, client: any[]) {
    return await this.clientGroupService.updateClientGroupById(clientGroupId, {
      client,
    });
  }

  private async getCurrentSocketInRoom(room: string) {
    return await this.server.in(room).fetchSockets();
  }

  private getRoomsExceptSelf(client: Socket) {
    const rooms = Array.from(client.rooms).filter((room) => room !== client.id);
    return rooms;
  }
}
