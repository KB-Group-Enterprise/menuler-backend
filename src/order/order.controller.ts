import { Body, Controller, Post } from '@nestjs/common';
import { CreateOrderDto } from './dto/CreateOrder.dto';
import { OrderService } from './order.service';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post('/create')
  async createOrder(@Body() orderDetails: CreateOrderDto) {
    // TODO get clientId
    const order = await this.orderService.createOrder(orderDetails);
    return {
      data: order,
      message: 'create order success',
    };
  }
}
