import { BadRequestException, Injectable } from '@nestjs/common';
import {
  FoodOrder,
  order_client_state,
  order_status,
  Prisma,
} from '@prisma/client';
import { PrismaException } from 'src/exception/Prisma.exception';
import { MenuService } from 'src/menu/menu.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { TableService } from 'src/table/table.service';
import { ClientCreateOrderDto } from './dto/ClientCreateOrder.dto';
import { ClientUpdateOrderDto } from './dto/ClientUpdateOrder.dto';
import { OrderFilter } from './dto/OrderFilter.dto';
import { food_order_status } from './types/FoodOrder';

@Injectable()
export class OrderService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly menuService: MenuService,
    private readonly tableService: TableService,
  ) {}
  async createOrder({
    foodOrderList,
    restaurantId,
    tableToken,
    clientGroupId,
  }: ClientCreateOrderDto) {
    const table = await this.tableService.findTableByTableToken(tableToken);
    if (!table) throw new BadRequestException(`table does not exist`);
    if (table.restaurantId !== restaurantId)
      throw new BadRequestException(`table does not exist in this restaurant`);

    const isOrderNotCheckout = table.order.filter(
      (order) => order.status === order_status.NOT_CHECKOUT,
    ).length
      ? true
      : false;

    if (isOrderNotCheckout)
      throw new BadRequestException(`previous order still not check out`);

    const validatedMenuList = await this.menuService.validateMenuList(
      foodOrderList,
    );

    const createManyFoodOrder: Prisma.FoodOrderCreateManyOrderInputEnvelope = {
      data: validatedMenuList.map((menu, index) => {
        return {
          clientId: foodOrderList[index].userId,
          menuId: menu.id,
          note: foodOrderList[index].note,
          optionIds: [...foodOrderList[index].selectedOptions],
        };
      }),
    };
    const clientGroup = await this.prisma.clientGroup.findUnique({
      where: { id: clientGroupId },
    });
    if (!clientGroup)
      throw new BadRequestException(`clientGroupId: ${clientGroupId} invalid`);
    const createdOrder = await this.insertOrder({
      restaurant: { connect: { id: restaurantId } },
      table: { connect: { tableToken: tableToken } },
      foodOrderList: { createMany: createManyFoodOrder },
      clientGroup: { connect: { id: clientGroupId } },
    });
    return createdOrder;
  }

  async findOrderByClientGroupId(clientGroupId: string) {
    return await this.prisma.order.findUnique({
      where: { clientGroupId },
      include: { foodOrderList: { include: { menu: true } }, bill: true },
    });
  }

  async insertOrder(orderDetails: Prisma.OrderCreateInput) {
    const order = await this.prisma.order.create({
      data: { ...orderDetails },
    });
    return order;
  }

  async findOrderByOrderId(orderId: string) {
    return await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        table: true,
        clientGroup: true,
        foodOrderList: { include: { menu: true, options: true } },
        bill: true,
      },
    });
  }

  async updateOrderById(
    orderId: string,
    orderDetails: Prisma.OrderUpdateInput,
  ) {
    return await this.prisma.order.update({
      data: { ...orderDetails },
      where: { id: orderId },
      include: { foodOrderList: { include: { menu: true } }, table: true },
    });
  }

  async clientConfirmOrderCase(
    orderId: string,
    orderDetails: ClientUpdateOrderDto,
  ) {
    try {
      const updatedOrder = await this.prisma.order.update({
        data: {
          clientState: order_client_state.CONFIRMED,
          updatedAt: new Date(),
          table: { connect: { tableToken: orderDetails.tableToken } },
        },
        where: { id: orderId },
      });
    } catch (error) {
      throw new PrismaException(error);
    }
  }

  async deleteOrderByOrderId(orderId: string) {
    try {
      await this.prisma.order.delete({
        where: { id: orderId },
      });
    } catch (error) {
      throw new PrismaException(error);
    }
  }

  async findAllOrderByRestaurantId(restaurantId: string, option: OrderFilter) {
    return await this.prisma.order.findMany({
      where: {
        restaurantId,
        status: option.isNeedBilling ? undefined : option.status,
        OR: option.isNeedBilling
          ? [
              { status: order_status.BILLING },
              { status: order_status.NOT_CHECKOUT },
            ]
          : undefined,
      },
      include: {
        restaurant: true,
        table: true,
        foodOrderList: { include: { menu: true } },
        bill: true,
      },
      orderBy: { createAt: 'desc' },
      skip: option.pagination?.skip || 0,
      take: option.pagination?.limit || 10,
    });
  }
}
