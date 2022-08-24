import { Controller, Delete, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAdminAuthGuard } from 'src/auth/guards/jwt.guard';
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

  // @Get('/:restaurantId/current_order')
  // async getCurrentOrderByRestaurantId(
  //   @Param('restaurantId') restaurantId: string,
  // ) {}

  @Delete('/:orderId')
  @UseGuards(JwtAdminAuthGuard)
  async deleteOrder(@Param('orderId') orderId: string) {
    await this.orderService.deleteOrderByOrderId(orderId);
    return {
      message: `order id : ${orderId} has been removed`,
    };
  }
}
