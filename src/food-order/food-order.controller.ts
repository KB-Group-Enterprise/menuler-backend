import { Controller, Delete, Param, UseGuards } from '@nestjs/common';
import { JwtAdminAuthGuard } from 'src/auth/guards/jwt-admin.guard';
import { FoodOrderService } from './food-order.service';

@Controller('food-order')
export class FoodOrderController {
  constructor(private readonly foodOrderService: FoodOrderService) {}

  @Delete('/client/:clientId')
  @UseGuards(JwtAdminAuthGuard)
  async deleteClientIdInFoodOrder(@Param('clientId') clientId: string) {
    await this.foodOrderService.deleteFoodOrderOrRemoveClientInFoodOrder(
      clientId,
    );
    return {
      data: {},
      message: 'delete client in food order by client id success',
    };
  }
}
