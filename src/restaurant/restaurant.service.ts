import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class RestaurantService {
  constructor(private prisma: PrismaService) {}

  async createRestaurant(details: Prisma.RestaurantCreateInput) {
    const isExist = await this.prisma.restaurant.findUnique({
      where: { restaurantName: details.restaurantName },
    });
    if (isExist)
      throw new ConflictException({
        message: `Restaurant name ${details.restaurantName} is already exist`,
      });
    return await this.prisma.restaurant.create({
      data: {
        ...details,
      },
    });
  }
}
