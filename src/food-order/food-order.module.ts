import { Module } from '@nestjs/common';
import { FoodOrderService } from './food-order.service';
import { FoodOrderController } from './food-order.controller';

@Module({
  providers: [FoodOrderService],
  exports: [FoodOrderService],
  controllers: [FoodOrderController],
})
export class FoodOrderModule {}
