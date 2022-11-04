import { BadRequestException, Injectable } from '@nestjs/common';
import {
  Client,
  ClientGroup,
  client_group_status,
  Order,
  order_status,
  Prisma,
} from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { Server } from 'socket.io';
import { EVENT_TYPE } from 'src/utils/enums/event-type.enum';
import { TableService } from 'src/table/table.service';
import { OrderService } from 'src/order/order.service';
import { ClientGroupService } from 'src/client-group/client-group.service';
import { FoodOrderService } from 'src/food-order/food-order.service';

@Injectable()
export class ClientService {
  public server: Server = null;
  constructor(
    private readonly prisma: PrismaService,
    private tableService: TableService,
    private orderService: OrderService,
    private clientGroupService: ClientGroupService,
    private foodOrderService: FoodOrderService,
  ) {}

  async findClientById(id: string) {
    return await this.prisma.client.findUnique({
      where: { id },
      include: { clientGroup: true },
    });
  }

  async findClientByUsernameAndClientGroupId(
    username: string,
    clientGroupId: string,
  ) {
    return await this.prisma.client.findFirst({
      where: { username: username, clientGroupId: clientGroupId },
    });
  }

  async findClientOrCreate(clientData: Prisma.ClientCreateInput, id?: string) {
    let client;
    if (!id) {
      client = await this.createClient(clientData);
      return client;
    }
    client = await this.findClientById(id);
    if (
      !client ||
      (client as Client & { clientGroup: ClientGroup })?.clientGroup?.status ===
        'COMPLETED'
    ) {
      client = await this.createClient(clientData);
      return client;
    }
    client = await this.updateClientById(client.id, {
      status: 'ONLINE',
      clientGroup: clientData.clientGroup,
    });
    return client;
  }

  async createClient(clientData: Prisma.ClientCreateInput) {
    return await this.prisma.client.create({
      data: { ...clientData },
    });
  }

  async updateClientById(
    clientId: string,
    updateClient: Prisma.ClientUpdateInput,
  ) {
    if (!clientId) return;
    return await this.prisma.client.update({
      data: { ...updateClient },
      where: { id: clientId },
    });
  }

  async deleteClientById(clientId: string) {
    return await this.prisma.client.delete({
      where: { id: clientId },
    });
  }

  async clearTable(tableToken: string) {
    const clientGroup = await this.getCurrentClientGroupOrNew(tableToken);
    const updatedClientGroup =
      await this.clientGroupService.updateClientGroupById(clientGroup.id, {
        order: { update: { status: 'CANCEL' } },
        status: 'REJECT',
      });
    const foodOrders = await this.foodOrderService.findFoodOrdersByOrderId(
      updatedClientGroup.order.id,
    );
    const rejectFoodOrderPromises = foodOrders.map((fd) =>
      this.foodOrderService.updateFoodOrderById(fd.id, { status: 'CANCEL' }),
    );
    await Promise.all([...rejectFoodOrderPromises]);
    this.notiToTable(tableToken, clientGroup);
    this.server.to(updatedClientGroup.order.restaurantId).emit('currentOrder', {
      orders: await this.orderService.findAllOrderByRestaurantId(
        updatedClientGroup.order.restaurantId,
        { isNeedBilling: true },
      ),
    });
  }

  async notiToTable(
    tableToken: string,
    clientGroup: ClientGroup & { client: Client[] },
    detail?: any,
  ) {
    const table = await this.tableService.findTableByTableToken(tableToken);
    const allSelectedFoodList = clientGroup.selectedFoodList;
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

  async getCurrentClientGroupOrNew(tableToken: string) {
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
}
