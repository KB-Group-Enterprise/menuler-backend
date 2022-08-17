import { BadRequestException, Logger, UseFilters } from '@nestjs/common';
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
import {
  ClientGroup,
  client_group_status,
  Order,
  order_status,
  Table,
} from '@prisma/client';
import { Socket, Server } from 'socket.io';
import { ClientGroupService } from 'src/client-group/client-group.service';
import { CustomWsResponse } from '../client/dto/CustomWsResponse';
import { JoinOrLeaveTable } from './dto/JoinTable.dto';
import { EVENT_TYPE } from '../utils/enums/event-type.enum';
import { TableService } from '../table/table.service';
import { SelectFood } from 'src/client/dto/SelectFood.dto';
import short = require('short-uuid');
import { DeselectFood } from './dto/DeselectFood.dto';
import { WsErrorHandler } from 'src/filters/WsErrorHandler.filter';
import { FoodOrderInput } from 'src/order/dto/FoodOrderInput.dto';
import shortUUID = require('short-uuid');
import { OrderService } from 'src/order/order.service';
import { Client } from './types/client';
@UseFilters(WsErrorHandler)
@WebSocketGateway(3505, { namespace: 'client', cors: { origin: '*' } })
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
    private orderService: OrderService,
  ) {}

  afterInit(server: Server) {
    this.logger.log('TableGateWay Init');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    // const order = await
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
                userId: user.id,
              };
          })
          .filter((user) => (user ? true : false));
        const clientGroup = await this.getCurrentClientGroupOrNew(room);
        await this.notiToTable(room, clientGroup, {
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
      client.data.userId = shortUUID().generate();
      client.data.username = event.username;
      client.data.joinedAt = Date.now();
      client.join(table.id);
      const clientGroup = await this.getCurrentClientGroupOrNew(table.id);
      await this.notiToTable(event.tableId, clientGroup, {
        message: `${event.username} joined`,
        type: EVENT_TYPE.NOTI,
      });

      return {
        event: 'joinedTable',
        data: {
          userId: client.data.userId,
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
      const clientGroup = await this.getCurrentClientGroupOrNew(tableId);
      const sockets = await this.getCurrentSocketInRoom(tableId);
      await this.updateClientGroup(clientGroup.id, sockets);

      await this.notiToTable(event.tableId, clientGroup, {
        message: `${event.username} left`,
        type: EVENT_TYPE.NOTI,
      });

      return {
        event: 'leftTable',
        data: {
          userId: client.id,
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
      const table = await this.tableService.findTableById(event.tableId);
      if (!table) throw Error('tableId invalid');
      let clientGroup = await this.getCurrentClientGroupOrNew(table.id);
      event.selectedFood.userId = client.data.userId;
      event.selectedFood.foodOrderId = short().generate();
      client.data.selectedFoodList = [
        ...(client.data.selectedFoodList?.length
          ? client.data.selectedFoodList
          : []),
        event.selectedFood,
      ];
      const clientSelectedFood = event.selectedFood as unknown as any[];
      clientGroup = await this.clientGroupService.updateClientGroupById(
        clientGroup.id,
        {
          selectedFoodList: { push: clientSelectedFood },
        },
      );
      await this.notiToTable(event.tableId, clientGroup, {
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

  @SubscribeMessage('deselectFood')
  async handleDeselectFood(
    @ConnectedSocket() client: Socket,
    @MessageBody() event: DeselectFood,
  ): Promise<WsResponse<CustomWsResponse>> {
    try {
      const tableId = Array.from(client.rooms).find(
        (room) => room === event.tableId,
      );
      if (!tableId) throw new Error('your tableId is invalid');
      const clientGroup = await this.getCurrentClientGroupOrNew(tableId);
      const allSelectedFoodList = await this.getSelectedFoodList(event.tableId);
      const deselectedFood = allSelectedFoodList.splice(
        allSelectedFoodList.findIndex(
          (food) => food.foodOrderId === event.foodOrderId,
        ),
        1,
      )[0];

      await this.notiToTable(tableId, clientGroup, {
        selectedFoodList: allSelectedFoodList,
        message: `${event.username} deselected ${deselectedFood.foodName}`,
        type: EVENT_TYPE.NOTI,
      });

      const clientSelectedFood = client.data
        .selectedFoodList as FoodOrderInput[];
      clientSelectedFood.splice(
        clientSelectedFood.findIndex(
          (food) => food.foodOrderId === event.foodOrderId,
        ),
      );
      return {
        event: 'deselectedFood',
        data: {
          message: `You deselect ${deselectedFood.foodName}`,
          type: EVENT_TYPE.DESELETED,
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

  private async createClientGroup(table: Table, clients: any[]) {
    const clientList = clients.map((client) => ({
      userId: client.data.userId,
      ...client.data,
    }));
    return await this.clientGroupService.createClientGroup({
      table: { connect: { id: table.id } },
      client: clientList,
    });
  }

  private async updateClientGroup(clientGroupId: string, clients: any[]) {
    const clientList = clients.map((client) => ({
      userId: client.data.userId,
      ...client.data,
    }));
    return await this.clientGroupService.updateClientGroupById(clientGroupId, {
      client: clientList,
    });
  }

  private async notiToTable(
    tableId: string,
    clientGroup: ClientGroup,
    detail: any,
  ) {
    const sockets = await this.getCurrentSocketInRoom(tableId);
    const allUser = sockets.map((user) => ({
      userId: user.data.userId,
      username: user.data.username,
    }));
    const allSelectedFoodList = clientGroup.selectedFoodList;
    this.server.to(tableId).emit('noti-table', {
      usernameInRoom: allUser,
      selectedFoodList: allSelectedFoodList,
      clientGroupId: clientGroup.id,
      ...detail,
    });
  }

  private async getCurrentClientGroupOrNew(tableId: string) {
    if (!tableId) return;
    const table = await this.tableService.findTableById(tableId);
    if (!table) throw new BadRequestException(`table does not exist`);

    let clientGroup: ClientGroup;
    const sockets = await this.getCurrentSocketInRoom(table.id);
    const isOrderStillNotCheckout = this.isOrderStillNotCheckOut(table.order);
    const clientGroupInProgress = this.findClientGroupInProgress(
      table.clientGroup,
    );
    if (isOrderStillNotCheckout && clientGroupInProgress) {
      clientGroup = clientGroupInProgress;
      await this.updateClientGroup(clientGroup.id, sockets);
    } else {
      clientGroup = await this.createClientGroup(table, sockets);
    }
    return clientGroup;
  }

  private findUserInClientGroup(userId: string, clientGroup: ClientGroup) {
    const clients = clientGroup.client as unknown as Client[];
    return clients.find((client) => client.userId === userId);
  }

  private isOrderStillNotCheckOut(order: Order[]) {
    if (order.length === 0) return true;
    return order.filter((order) => order.status === order_status.NOT_CHECKOUT)
      .length
      ? true
      : false;
  }

  private findClientGroupInProgress(clientGroups: ClientGroup[]) {
    return clientGroups.find(
      (cg) => cg.status === client_group_status.IN_PROGRESS,
    );
  }

  private async getCurrentSocketInRoom(room: string) {
    return await this.server.in(room).fetchSockets();
  }

  private getRoomsExceptSelf(client: Socket) {
    const rooms = Array.from(client.rooms).filter((room) => room !== client.id);
    return rooms;
  }

  private async getSelectedFoodList(tableId: string) {
    const sockets = await this.getCurrentSocketInRoom(tableId);
    const selectedFoodList = sockets
      .map((user) => user.data.selectedFoodList)
      .filter((foodList) => foodList !== undefined || null)
      .reduce((a: string[], b: string[]) => a.concat(b), []);
    return selectedFoodList as FoodOrderInput[];
  }
}
