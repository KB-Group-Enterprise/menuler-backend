import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class FoodOrderService {
  constructor(private prisma: PrismaService) {}

  async findFoodOrderByClientId(clientId: string) {
    return await this.prisma.foodOrder.findMany({
      where: { clientId: { equals: clientId } },
    });
  }

  async deleteFoodOrderOrRemoveClientInFoodOrder(clientId: string) {
    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
      include: { clientGroup: true },
    });
    // console.log('selectedFoodList', client.clientGroup.selectedFoodList);

    const selectedFoodList = client.clientGroup.selectedFoodList.filter(
      (food: any) => food.userId !== clientId,
    );
    if (selectedFoodList.length) {
      await this.prisma.clientGroup.update({
        data: { selectedFoodList },
        where: { id: client.clientGroupId },
      });
    }
    // console.log('selectedFoodList', selectedFoodList);

    const foodOrders = await this.findFoodOrderByClientId(clientId);

    // console.log(foodOrders);
    const deleteFoodOrderPromise = foodOrders
      .filter((foodOrder) => foodOrder.clientId.length === 1)
      .map((foodOrder) => this.deleteFoodOrderById(foodOrder.id));
    if (deleteFoodOrderPromise.length) {
      await Promise.all([...deleteFoodOrderPromise]);
    }
    // console.log('deleteFoodOrderPromise', deleteFoodOrderPromise);

    // const removeClientFromFoodOrderPromise = foodOrders.filter(
    //   (foodOrder) => foodOrder.clientId.length > 1,
    // );
    // console.log('removeClientFromFoodOrder', removeClientFromFoodOrderPromise);
    // if (removeClientFromFoodOrderPromise.length) {
    //   await Promise.all([...removeClientFromFoodOrderPromise]);
    // }
    await this.prisma.client.delete({ where: { id: clientId } });
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
