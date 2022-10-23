import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Admin, Restaurant } from '@prisma/client';
import { CurrentUser } from 'src/auth/current-user';
import { JwtAdminAuthGuard } from 'src/auth/guards/jwt-admin.guard';
import { OrderFilter } from './dto/OrderFilter.dto';
import { OrderService } from './order.service';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  // @Post('/create')
  // async createOrder(@Body() orderDetails: CreateOrderDto) {
  //   // TODO get clientId
  //   const order = await this.orderService.createOrder(orderDetails);
  //   return {
  //     data: order,
  //     message: 'create order success',
  //   };
  // }

  @Get('/:orderId')
  async getOrder(@Param('orderId') orderId: string) {
    const order = await this.orderService.findOrderByOrderId(orderId);

    return {
      data: order,
      message: `get order success`,
    };
  }

  @Post('/orders')
  @UseGuards(JwtAdminAuthGuard)
  async getAllOrderByRestaurantId(
    @Body() filter: OrderFilter,
    @CurrentUser() account: Admin,
  ) {
    const orders = await this.orderService.findAllOrderByRestaurantId(
      account.restaurantId,
      filter,
    );
    return {
      data: orders,
      message: 'get all order by restaurant id',
    };
  }

  @Delete('/:orderId')
  @UseGuards(JwtAdminAuthGuard)
  async deleteOrder(@Param('orderId') orderId: string) {
    await this.orderService.deleteOrderByOrderId(orderId);
    return {
      message: `order id : ${orderId} has been removed`,
    };
  }
}
