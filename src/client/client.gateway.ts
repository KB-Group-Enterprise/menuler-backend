import {
  BadRequestException,
  Logger,
  UseFilters,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
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
  Admin,
  Client,
  ClientGroup,
  client_group_status,
  Order,
  order_status,
  Prisma,
  Role,
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
import { WsErrorHandler } from 'src/utils/filters/WsErrorHandler.filter';
import { FoodOrderInput } from 'src/order/dto/FoodOrderInput.dto';
import { OrderService } from 'src/order/order.service';
import { MenuService } from 'src/menu/menu.service';
import { ClientCreateOrderDto } from 'src/order/dto/ClientCreateOrder.dto';
import { ClientUpdateOrderDto } from 'src/order/dto/ClientUpdateOrder.dto';
import { WsJwtGuard } from 'src/auth/guards/ws-jwt.guard';
import { ClientService } from './client.service';
import { FoodOrderService } from 'src/food-order/food-order.service';
import { CurrentWsAdmin } from 'src/auth/current-ws-admin';
import { AdminUpdateOrderDto } from './dto/AdminUpdateOrder.dto';
import { UpdateFoodOrderDto } from 'src/food-order/dto/update-food-order.dto';
import { BillService } from 'src/bill/bill.service';
import { IoTThingsGraph } from 'aws-sdk';
@UseFilters(WsErrorHandler)
@UsePipes(new ValidationPipe({ transform: true }))
@WebSocketGateway(3505, {
  namespace: 'client',
  cors: { origin: '*', credentials: true, methods: '*' },
})
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
    private menuService: MenuService,
    private clientService: ClientService,
    private foodOrderService: FoodOrderService,
    private billService: BillService,
  ) {}

  afterInit(server: Server) {
    this.logger.log('TableGateWay Init');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    client.on('disconnecting', async (reason) => {
      if (!client.data.admin) {
        const rooms = this.getRoomsExceptSelf(client);
        this.logger.log(reason);
        if (client.data?.userId) {
          await this.clientService.updateClientById(client.data.userId, {
            status: 'OFFLINE',
          });
        }
        for (const room of rooms) {
          // const sockets = await this.getCurrentSocketInRoom(room);
          // const allUser = sockets
          //   .map((user) => {
          //     if (user.id !== client.id)
          //       return {
          //         username: user.data.username,
          //         userId: user.id,
          //       };
          //   })
          //   .filter((user) => (user ? true : false));
          const clientGroup = await this.getCurrentClientGroupOrNew(room);
          await this.notiToTable(room, clientGroup, {
            // usernameInRoom: allUser,
            message: `${client.data.username} left`,
            type: EVENT_TYPE.NOTI,
          });
        }
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
      if (!table.isActivate)
        throw new BadRequestException('this table is not avaiable');
      let clientGroup = await this.getCurrentClientGroupOrNew(table.tableToken);
      const isUsernameExist = await this.clientService.findClientByUsernameAndClientGroupId(event.username, clientGroup.id);
      if (isUsernameExist && !event.userId) {
        throw new Error('[handleJoinTable] username taken');
      }
      const user = await this.clientService.findClientOrCreate(
        {
          username: event.username,
          clientGroup: { connect: { id: clientGroup.id } },
        },
        event.userId,
      );
      client.data.userId = user.id;
      client.data.username = user.username;
      client.data.joinedAt = Date.now();
      client.join(table.tableToken);
      clientGroup = await this.getCurrentClientGroupOrNew(table.tableToken);
      await this.notiToTable(event.tableToken, clientGroup, {
        message: `${event.username} joined`,
        type: EVENT_TYPE.NOTI,
      });

      return {
        event: 'joinedTable',
        data: {
          userId: user.id,
          username: user.username,
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
      const clientGroup = await this.getCurrentClientGroupOrNew(tableToken);
      const foodOrder = await this.foodOrderService.findFoodOrderByClientId(
        client.data.userId,
      );
      if (!foodOrder.length) {
        await this.clientService.deleteClientById(client.data.userId);
        client.leave(event.tableToken);
      } else {
        throw new BadRequestException('Your food order still there');
      }
      await this.notiToTable(event.tableToken, clientGroup, {
        message: `${event.username} left`,
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
      // let clientGroup: any
      if (!table) throw Error('tableToken invalid');
      await this.menuService.validateMenuList(event.selectedFood);
      let clientGroup = await this.getCurrentClientGroupOrNew(table.tableToken);


      event.selectedFood.forEach((foodOrder) => {
        foodOrder.userId = event['userId'];
        foodOrder.username = event.username;
        foodOrder.foodOrderId = short().generate();

        // console.log(foodOrder);
      });
      client.data.selectedFoodList = [
        ...(client.data.selectedFoodList?.length
          ? client.data.selectedFoodList
          : []),
        ...event.selectedFood,
      ];
      const clientSelectedFood = event.selectedFood as unknown as any[];
      clientGroup = await this.clientGroupService.updateClientGroupById(
        clientGroup.id,
        {
          selectedFoodList: { push: clientSelectedFood },
        },
      );
      await this.notiToTable(event.tableToken, clientGroup, {
        message: `${event.username} selected ${event.selectedFood
          .map((food) => food.foodName)
          .join(',')}`,
      });
      return {
        event: 'selectedFood',
        data: {
          message: `You selected menu id: ${event.selectedFood
            .map((food) => food.foodName)
            .join(',')}`,
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
      const table = await this.tableService.findTableByTableToken(
        event.tableToken,
      );
      if (!table) throw Error('tableToken invalid');
      // console.log(client.rooms);
      // const tableToken = Array.from(client.rooms).find(
      //   (room) => room === event.tableToken,
      // );
      // if (!tableToken) throw new Error('your tableToken is invalid');
      const tableToken = event.tableToken;
      const clientGroup = await this.getCurrentClientGroupOrNew(tableToken);
      const allSelectedFoodList = clientGroup.selectedFoodList;
      const deselectedFood = await this.deselectFood(
        event.foodOrderId,
        clientGroup,
      );

      await this.notiToTable(tableToken, clientGroup, {
        selectedFoodList: allSelectedFoodList,
        message: `${event.username} deselected ${deselectedFood.foodName}`,
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

  @SubscribeMessage('handleCreateOrder')
  async handlerCreateOrder(
    @MessageBody() event: ClientCreateOrderDto,
    @ConnectedSocket() client: Socket,
  ): Promise<WsResponse<CustomWsResponse>> {
    try {
      await this.createOrder(event, client);
      return {
        data: {
          message: `Create order success`,
          type: EVENT_TYPE.ORDER,
        },
        event: 'createdOrder',
      };
    } catch (error) {
      console.log(error);
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

  @SubscribeMessage('handleUpdateOrder')
  async handleUpdateOrder(
    @ConnectedSocket() client: Socket,
    @MessageBody() event: ClientUpdateOrderDto,
  ): Promise<WsResponse<CustomWsResponse>> {
    try {
      await this.updateOrder(event, client);
      return {
        data: {
          message: `Update order success`,
          type: EVENT_TYPE.ORDER,
        },
        event: 'updatedOrder',
      };
    } catch (error) {
      console.log(error);
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

  @SubscribeMessage('getCurrentOrder')
  @UseGuards(WsJwtGuard)
  async findCurrentOrder(
    @ConnectedSocket() client: Socket,
  ): Promise<WsResponse<CustomWsResponse>> {
    const admin = client.data.admin as Admin & { role: Role };
    const orders = await this.orderService.findAllOrderByRestaurantId(
      admin.restaurantId,
      { isNeedBilling: true },
    );
    this.server.to(admin.restaurantId).emit('currentOrder', {
      orders: orders,
    });
    return {
      event: 'currentOrder',
      data: {
        orders: orders,
        message: 'get all current order',
        type: EVENT_TYPE.ORDER,
      },
    };
  }

  @SubscribeMessage('updateClientOrder')
  @UseGuards(WsJwtGuard)
  async updateClientOrder(
    @ConnectedSocket() client: Socket,
    @MessageBody() event: AdminUpdateOrderDto,
  ): Promise<WsResponse<CustomWsResponse>> {
    const order = await this.adminUpdateClientOrder(event);
    await this.findCurrentOrder(client);
    return {
      event: 'updatedClientOrder',
      data: {
        order: order,
        message: `update order id: ${event.orderId} success`,
        type: EVENT_TYPE.ORDER,
      },
    };
  }
  async deleteFoodOrderList(deleteFoodOrderList: string[], orderId: string) {
    const validatedFoodOrderList =
      await this.foodOrderService.validateFoodOrderByOrderId(
        deleteFoodOrderList,
        orderId,
      );
    const deleteFoodOrderPromises = validatedFoodOrderList.map((foodOrder) => {
      return this.foodOrderService.deleteFoodOrderById(foodOrder.id);
    });
    await Promise.all([...deleteFoodOrderPromises]);
  }

  async updateFoodOrderList(
    updateFoodOrderList: UpdateFoodOrderDto[],
    orderId: string,
  ) {
    await this.foodOrderService.validateFoodOrderByOrderId(
      updateFoodOrderList.map((fd) => fd.foodOrderId),
      orderId,
    );
    const updateFoodOrderPromises = updateFoodOrderList.map((fd) => {
      return this.foodOrderService.updateFoodOrderById(fd.foodOrderId, {
        status: fd.status,
      });
    });
    return await Promise.all([...updateFoodOrderPromises]);
  }

  async deleteClientList(clientIds: string[]) {
    const deleteFoodOrderOfThatClient = clientIds.map((clientId) => {
      return this.foodOrderService.deleteFoodOrderOrRemoveClientInFoodOrder(
        clientId,
      );
    });
    // const deleteClientPromise = clientIds.map((clientId) => {
    //   return this.clientService.deleteClientById(clientId);
    // });
    await Promise.all([deleteFoodOrderOfThatClient]);
  }

  async adminUpdateClientOrder(updateDto: AdminUpdateOrderDto) {
    if (updateDto.deleteFoodOrderList?.length) {
      await this.deleteFoodOrderList(
        updateDto.deleteFoodOrderList,
        updateDto.orderId,
      );
    }
    if (updateDto.updateFoodOrderList?.length) {
      await this.updateFoodOrderList(
        updateDto.updateFoodOrderList,
        updateDto.orderId,
      );
    }
    if (updateDto.deleteClientList?.length) {
      await this.deleteClientList(updateDto.deleteClientList);
    }

    const connectTable = updateDto.transferTableId
      ? { connect: { id: updateDto.transferTableId } }
      : undefined;
    const order = await this.orderService.findOrderByOrderId(updateDto.orderId);
    const isFoodOrderNotServed = order.foodOrderList.some(
      (foodOrder) =>
        foodOrder.status === 'COOKING' || foodOrder.status === 'PENDING',
    );
    if (updateDto.status === 'BILLING') {
      if (isFoodOrderNotServed)
        throw new BadRequestException(
          'All food order must be served before check bill',
        );
      const totalPrice = order.foodOrderList.reduce(
        (total: number, foodOrder) => {
          if (foodOrder.status === 'CANCEL') {
            return total;
          }
          total += foodOrder.menu.price;
          total += foodOrder.options.reduce(
            (totalOptionPrice, option) => totalOptionPrice + option.price,
            0,
          );
          return total;
        },
        0,
      );
      await this.billService.createBill({
        order: { connect: { id: order.id } },
        totalPrice,
      });
    }
    let isPaid;
    if (updateDto.bill) {
      const bill = await this.billService.updateBillById(
        updateDto.bill.billId,
        {
          status: updateDto.bill.status,
        },
      );
      isPaid = bill.status === 'PAID' ? true : false;
    }
    const updatedOrder = await this.orderService.updateOrderById(
      updateDto.orderId,
      {
        clientState: updateDto.clientState,
        updatedAt: new Date(),
        overallFoodStatus: isFoodOrderNotServed ? 'PENDING' : 'ALL_SERVED',
        table: connectTable,
        status: isPaid ? 'PAID' : updateDto.status,
      },
    );
    if (isPaid) {
      await this.clientGroupService.updateClientGroupById(
        updatedOrder.clientGroupId,
        { status: 'COMPLETED' },
      );
    }
    let clientGroup;
    if (updatedOrder.status === 'PAID') {
      clientGroup = await this.clientGroupService.findClientGroupById(
        updatedOrder.clientGroupId,
      );
    } else {
      clientGroup = await this.getCurrentClientGroupOrNew(
        updatedOrder.table.tableToken,
      );
    }

    await this.notiToTable(updatedOrder.table.tableToken, clientGroup, {
      message: 'waiter has been update your order',
      order: updatedOrder,
    });
    return updatedOrder;
  }

  async updateOrder(updateData: ClientUpdateOrderDto, client: Socket) {
    let createManyFoodOrder:
      | Prisma.FoodOrderCreateManyOrderInputEnvelope
      | undefined;
    if (updateData.additionalFoodOrderList) {
      const validatedMenuList = await this.menuService.validateMenuList(
        updateData.additionalFoodOrderList,
      );
      createManyFoodOrder = {
        data: validatedMenuList.map((menu, index) => {
          const foodOrder = updateData.additionalFoodOrderList[index];
          return {
            clientId: foodOrder.userId,
            menuId: menu.id,
            note: foodOrder.note,
            optionIds: foodOrder.selectedOptions,
          };
        }),
      };
    }
    // const additionalFoodOrderList = updateData.additionalFoodOrderList as any[];
    // for (let index = 0; index < additionalFoodOrderList.length; index++) {
    //   const foodOrder = additionalFoodOrderList[index];
    //   foodOrder.status = food_order_status.ORDERED;
    //   foodOrder.imageUrl = validatedMenuList[index].imageUrl;
    // }
    // order.foodOrderList.push(...additionalFoodOrderList);
    const isAdditionFood = updateData.additionalFoodOrderList?.length
      ? true
      : false;
    const order = await this.orderService.findOrderByOrderId(
      updateData.orderId,
    );
    const isFoodOrderAllServed =
      order.overallFoodStatus === 'ALL_SERVED' ? true : false;
    const updatedOrder = await this.orderService.updateOrderById(
      updateData.orderId,
      {
        clientState: updateData.clientState,
        table: updateData.tableToken
          ? { connect: { tableToken: updateData.tableToken } }
          : undefined,
        foodOrderList: createManyFoodOrder
          ? { createMany: createManyFoodOrder }
          : undefined,
        overallFoodStatus:
          isFoodOrderAllServed && isAdditionFood ? 'PENDING' : 'ALL_SERVED',
        updatedAt: new Date(),
      },
    );
    this.server.to(updatedOrder.restaurantId).emit('currentOrder', {
      orders: await this.orderService.findAllOrderByRestaurantId(
        updatedOrder.restaurantId,
        { status: 'NOT_CHECKOUT' },
      ),
    });
    const updatedClientGroup =
      await this.clientGroupService.updateClientGroupById(
        updateData.clientGroupId,
        { selectedFoodList: [] },
      );
    await this.notiToTable(updateData.tableToken, updatedClientGroup, {
      message: `create order`,
    });
    return updatedOrder;
  }

  async createOrder(createData: ClientCreateOrderDto, client: Socket) {
    const order = await this.orderService.createOrder({
      clientGroupId: createData.clientGroupId,
      foodOrderList: createData.foodOrderList,
      restaurantId: createData.restaurantId,
      tableToken: createData.tableToken,
    });
    if (!order) throw new BadRequestException('create order failed');
    this.server.to(order.restaurantId).emit('currentOrder', {
      orders: await this.orderService.findAllOrderByRestaurantId(
        order.restaurantId,
        {
          status: 'NOT_CHECKOUT',
        },
      ),
    });
    const updatedClientGroup =
      await this.clientGroupService.updateClientGroupById(
        createData.clientGroupId,
        { selectedFoodList: [] },
      );
    await this.notiToTable(createData.tableToken, updatedClientGroup, {
      message: `create order`,
    });
  }

  // private async updateClientGroup(clientGroupId: string, clients: any[]) {
  //   const clientList = clients.map((client) => ({
  //     userId: client.data.userId,
  //     ...client.data,
  //   }));
  //   return await this.clientGroupService.updateClientGroupById(clientGroupId, {
  //     client: clientList,
  //   });
  // }

  private async notiToTable(
    tableToken: string,
    clientGroup: ClientGroup & { client: Client[] },
    detail?: any,
  ) {
    // const sockets = await this.getCurrentSocketInRoom(tableToken);
    const table = await this.tableService.findTableByTableToken(tableToken);
    // const allUser = sockets.map((user) => ({
    //   userId: user.data.userId,
    //   username: user.data.username,
    // }));
    const allSelectedFoodList = clientGroup.selectedFoodList;
    // const clientGroup = await this.clientService.findClientById()
    const order = await this.orderService.findOrderByClientGroupId(
      clientGroup.id,
    );
    this.server.to(tableToken).emit('noti-table', {
      restaurantId: table.restaurantId,
      usernameInRoom: clientGroup.client,
      selectedFoodList: allSelectedFoodList,
      clientGroupId: clientGroup.id,
      order: order ? order : undefined,
      type: EVENT_TYPE.NOTI,
      ...detail,
    });
  }

  private async getCurrentClientGroupOrNew(tableToken: string) {
    if (!tableToken) return;
    const table = await this.tableService.findTableByTableToken(tableToken);
    if (!table) throw new BadRequestException(`table does not exist`);

    let clientGroup: ClientGroup & { client: Client[] };
    const isOrderStillNotCheckout = this.isOrderStillNotCheckOut(table.order);
    const clientGroupInProgress = this.findClientGroupInProgress(
      table.clientGroup,
    ) as ClientGroup & { client: Client[] };
    if (isOrderStillNotCheckout || clientGroupInProgress) {
      clientGroup = clientGroupInProgress;
    } else {
      clientGroup = await this.clientGroupService.createClientGroup({
        table: { connect: { id: table.id } },
      });
    }
    return clientGroup;
  }

  private isOrderStillNotCheckOut(order: Order[]) {
    if (order.length === 0) return false;
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
