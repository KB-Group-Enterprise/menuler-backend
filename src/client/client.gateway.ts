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
      const table = await this.tableService.findTableByTableToken(
        event.tableToken,
      );
      if (!table) throw new Error('No table');
      client.data.userId = shortUUID().generate();
      client.data.username = event.username;
      client.data.joinedAt = Date.now();
      client.join(table.tableToken);
      const clientGroup = await this.getCurrentClientGroupOrNew(
        table.tableToken,
      );
      await this.notiToTable(event.tableToken, clientGroup, {
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
      const tableToken = rooms.find((room) => room === event.tableToken);
      if (!tableToken) throw new Error('your tableToken is invalid');
      client.leave(event.tableToken);
      const clientGroup = await this.getCurrentClientGroupOrNew(tableToken);
      const sockets = await this.getCurrentSocketInRoom(tableToken);
      await this.updateClientGroup(clientGroup.id, sockets);

      await this.notiToTable(event.tableToken, clientGroup, {
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
      const table = await this.tableService.findTableByTableToken(
        event.tableToken,
      );
      if (!table) throw Error('tableToken invalid');
      let clientGroup = await this.getCurrentClientGroupOrNew(table.tableToken);
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
      await this.notiToTable(event.tableToken, clientGroup, {
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
      const tableToken = Array.from(client.rooms).find(
        (room) => room === event.tableToken,
      );
      if (!tableToken) throw new Error('your tableToken is invalid');
      const clientGroup = await this.getCurrentClientGroupOrNew(tableToken);
      const allSelectedFoodList = clientGroup.selectedFoodList;
      const deselectedFood = await this.deselectFood(
        event.foodOrderId,
        clientGroup,
      );

      await this.notiToTable(tableToken, clientGroup, {
        selectedFoodList: allSelectedFoodList,
        message: `${event.username} deselected ${deselectedFood.foodName}`,
        type: EVENT_TYPE.NOTI,
      });

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
    tableToken: string,
    clientGroup: ClientGroup,
    detail: any,
  ) {
    const sockets = await this.getCurrentSocketInRoom(tableToken);
    const allUser = sockets.map((user) => ({
      userId: user.data.userId,
      username: user.data.username,
    }));
    const allSelectedFoodList = clientGroup.selectedFoodList;
    this.server.to(tableToken).emit('noti-table', {
      usernameInRoom: allUser,
      selectedFoodList: allSelectedFoodList,
      clientGroupId: clientGroup.id,
      ...detail,
    });
  }

  private async getCurrentClientGroupOrNew(tableToken: string) {
    if (!tableToken) return;
    const table = await this.tableService.findTableByTableToken(tableToken);
    if (!table) throw new BadRequestException(`table does not exist`);

    let clientGroup: ClientGroup;
    const sockets = await this.getCurrentSocketInRoom(table.tableToken);
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

  private async deselectFood(foodOrderId: string, clientGroup: ClientGroup) {
    const foodOrderList =
      clientGroup.selectedFoodList as unknown as FoodOrderInput[];
    const deselectedFood = foodOrderList.splice(
      foodOrderList.findIndex((food) => food.foodOrderId === foodOrderId),
      1,
    )[0];
    await this.clientGroupService.updateClientGroupById(clientGroup.id, {
      selectedFoodList: foodOrderList as any,
    });
    return deselectedFood;
  }

  // private async getSelectedFoodList(tableToken: string) {
  //   const sockets = await this.getCurrentSocketInRoom(tableToken);
  //   const selectedFoodList = sockets
  //     .map((user) => user.data.selectedFoodList)
  //     .filter((foodList) => foodList !== undefined || null)
  //     .reduce((a: string[], b: string[]) => a.concat(b), []);
  //   return selectedFoodList as FoodOrderInput[];
  // }
}
