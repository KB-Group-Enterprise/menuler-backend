import { BadRequestException, Injectable } from '@nestjs/common';
import {
  Order,
  order_client_state,
  order_status,
  Prisma,
} from '@prisma/client';
import { PrismaException } from 'src/exception/Prisma.exception';
import { MenuService } from 'src/menu/menu.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { TableService } from 'src/table/table.service';
import { CreateOrderDto } from './dto/CreateOrder.dto';
import { UpdateOrderDto } from './dto/UpdateOrder.dto';
import { FoodOrder, food_order_status } from './types/FoodOrder';

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
    tableId,
    clientGroupId,
  }: CreateOrderDto) {
    const menuOrderList: FoodOrder[] = [];
    for (const foodOrder of foodOrderList) {
      const menu = await this.menuService.findMenuById(foodOrder.menuId);
      if (!menu) throw new BadRequestException(`menu does not exist`);
      if (menu.restaurantId !== restaurantId)
        throw new BadRequestException(`menu does not exist in this restaurant`);
      menuOrderList.push({ ...menu, status: food_order_status.PENDING });
    }
    const table = await this.tableService.findTableById(tableId);
    if (!table) throw new BadRequestException(`table does not exist`);
    if (table.restaurantId !== restaurantId)
      throw new BadRequestException(`table does not exist in this restaurant`);

    const isOrderStillNotCheckOut = table.order.filter(
      (order) => order.status === order_status.NOT_CHECKOUT,
    ).length
      ? true
      : false;

    if (isOrderStillNotCheckOut)
      throw new BadRequestException(`previous order still not check out`);

    const orderMenuList = menuOrderList as unknown as Prisma.JsonArray;
    const clientGroup = await this.prisma.clientGroup.findUnique({
      where: {
        id: clientGroupId,
      },
    });
    if (!clientGroup)
      throw new BadRequestException(`clientGroupId: ${clientGroupId} invalid`);
    const createdOrder = await this.insertOrder({
      restaurant: { connect: { id: restaurantId } },
      table: { connect: { id: table.id } },
      foodOrderList: orderMenuList,
      clientGroup: {
        connect: {
          id: clientGroupId,
        },
      },
    });
    return createdOrder;
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
    });
  }

  async updateOrderById(orderId: string, orderDetails: UpdateOrderDto) {
    // TODO updateOrder
    const order = await this.findOrderByOrderId(orderId);
  }

  async clientConfirmOrderCase(orderId: string, orderDetails: UpdateOrderDto) {
    try {
      const updatedOrder = await this.prisma.order.update({
        data: {
          clientState: order_client_state.COMFIRMED,
          updatedAt: new Date(),
          tableId: orderDetails.tableId,
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
}
