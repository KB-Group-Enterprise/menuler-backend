import { BadRequestException, Injectable } from '@nestjs/common';
import { order_status, Prisma } from '@prisma/client';
import { MenuService } from 'src/menu/menu.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { TableService } from 'src/table/table.service';
import { CreateOrderDto } from './dto/CreateOrder.dto';
import { FoodOrder, food_order_status } from './types/FoodOrder';

@Injectable()
export class OrderService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly menuService: MenuService,
    private readonly tableService: TableService,
  ) {}
  async createOrder({ foodOrderList, restaurantId, tableId }: CreateOrderDto) {
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
    const createdOrder = await this.insertOrder({
      restaurant: { connect: { id: restaurantId } },
      table: { connect: { id: table.id } },
      foodOrderList: orderMenuList,
    });
    return createdOrder;
  }

  async insertOrder(orderDetails: Prisma.OrderCreateInput) {
    const order = this.prisma.order.create({
      data: { ...orderDetails },
    });
    return order;
  }
}
