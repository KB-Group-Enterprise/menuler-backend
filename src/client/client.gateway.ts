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
import { CustomWsResponse } from '../table/dto/CustomWsResponse';
import { JoinOrLeaveTable } from '../table/dto/JoinTable.dto';
import { EVENT_TYPE } from '../utils/enums/event-type.enum';
import { TableService } from '../table/table.service';
import { SelectFood } from 'src/order/dto/SelectFood.dto';
import short = require('short-uuid');
@WebSocketGateway(3505, { namespace: 'client' })
export class ClientGateWay
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly NOTI_TABLE = 'noti-table';
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
          type: EVENT_TYPE.NOTI,
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
        type: EVENT_TYPE.NOTI,
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
        type: EVENT_TYPE.NOTI,
      });

      return {
        event: 'leftTable',
        data: {
          clientId: client.id,
          message: `${event.username} left`,
          type: EVENT_TYPE.LEFT,
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

  @SubscribeMessage('selectFood')
  async handleSelectFood(
    @ConnectedSocket() client: Socket,
    @MessageBody() event: SelectFood,
  ): Promise<WsResponse<CustomWsResponse>> {
    try {
      if (!event.tableId) throw Error('tableId invalid');
      event.selectedFood.clientId = client.id;
      event.selectedFood.foodOrderId = short().generate();
      client.data.selectedFoodList = [
        ...(client.data.selectedFoodList?.length
          ? client.data.selectedFoodList
          : []),
        event.selectedFood,
      ];
      const sockets = await this.getCurrentSocketInRoom(event.tableId);
      const allSelectedFoodList = sockets
        .map((user) => user.data.selectedFoodList)
        .filter((foodList) => foodList !== undefined || null)
        .reduce((a: string[], b: string[]) => a.concat(b), []);
      this.server.to(event.tableId).emit('noti-table', {
        selectedFoodList: allSelectedFoodList,
        message: `${event.username} selected ${event.selectedFood.foodName}`,
        type: EVENT_TYPE.NOTI,
      });
      return {
        event: 'selectedFood',
        data: {
          message: `You selected menu id: ${event.selectedFood.foodName}`,
          type: EVENT_TYPE.SELECTED,
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
