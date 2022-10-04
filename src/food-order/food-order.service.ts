import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class FoodOrderService {
  constructor(private prisma: PrismaService) {}

  async findFoodOrderByClientId(clientId: string) {
    return await this.prisma.foodOrder.findMany({
      where: { clientId },
    });
  }
}
