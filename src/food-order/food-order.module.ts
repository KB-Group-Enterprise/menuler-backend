import { Module } from '@nestjs/common';
import { FoodOrderService } from './food-order.service';

@Module({
  providers: [FoodOrderService],
  exports: [FoodOrderService],
})
export class FoodOrderModule {}
