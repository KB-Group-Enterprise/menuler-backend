import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class FoodOrderService {
  constructor(private prisma: PrismaService) {}

  async findFoodOrderByClientId(clientId: string) {
    return await this.prisma.foodOrder.findMany({
      where: { clientId },
    });
  }

  async findFoodOrderById(id: string) {
    return await this.prisma.foodOrder.findUnique({
      where: { id },
    });
  }

  async deleteFoodOrderById(id: string) {
    return await this.prisma.foodOrder.delete({
      where: { id },
    });
  }

  async validateFoodOrderByOrderId(foodOrderIds: string[], orderId: string) {
    const foodOrderPromises = foodOrderIds.map((foodOrderId) => {
      return this.findFoodOrderById(foodOrderId);
    });
    const foodOrderList = await Promise.all([...foodOrderPromises]);
    const isEveryFoodMatchOrderId = foodOrderList.every(
      (foodOrder) => foodOrder?.orderId === orderId,
    );
    if (!isEveryFoodMatchOrderId) {
      throw new BadRequestException(
        'food order that want to delete is invalid',
      );
    }
    return foodOrderList;
  }

  async updateFoodOrderById(
    id: string,
    updateData: Prisma.FoodOrderUpdateInput,
  ) {
    return await this.prisma.foodOrder.update({
      data: { ...updateData },
      where: { id },
    });
  }
}
