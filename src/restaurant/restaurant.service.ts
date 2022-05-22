import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Admin, Prisma } from '@prisma/client';
import { AdminService } from '../admin/admin.service';
import { PrismaException } from '../exception/Prisma.exception';

@Injectable()
export class RestaurantService {
  constructor(
    private prisma: PrismaService,
    private readonly adminService: AdminService,
  ) {}

  async createRestaurant(admin: Admin, details: Prisma.RestaurantCreateInput) {
    const isExist = await this.prisma.restaurant.findUnique({
      where: { restaurantName: details.restaurantName },
    });
    if (isExist)
      throw new ConflictException(
        `Restaurant name ${details.restaurantName} is already exist`,
      );
    if (admin.restaurantId) {
      throw new BadRequestException('you alreay have restaurant');
    }
    const newRestaurant = await this.prisma.restaurant.create({
      data: { ...details },
    });

    await this.adminService.updateAdminWithRestaurantId(
      admin.id,
      newRestaurant.id,
    );
    return newRestaurant;
  }

  async deleteRestaurant(restaurantName: string) {
    try {
      await this.prisma.restaurant.delete({
        where: { restaurantName },
      });
      // TODO delete qrcode of that restaurant
    } catch (error) {
      throw new PrismaException(error);
    }
  }

  async findRestaurantById(restaurantId: string) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: {
        id: restaurantId,
      },
      include: { menu: true, qrcode: true },
    });
    return restaurant;
  }

  async findAllRestaurant() {
    return await this.prisma.restaurant.findMany();
  }

  async updateRestaurantInfo(
    admin: Admin,
    details: Prisma.RestaurantUpdateInput,
  ) {
    const updatedRestaurant = await this.prisma.restaurant.update({
      data: {
        ...details,
        updatedAt: new Date(),
        updatedBy: {
          connect: {
            id: admin.id,
          },
        },
      },
      where: { id: admin.restaurantId },
    });
    return updatedRestaurant;
  }

  async deleteRestaurantById(restaurantId: string, admin: Admin) {
    try {
      if (restaurantId !== admin.restaurantId)
        throw new BadRequestException('you can only delete your restaurant');

      await this.prisma.restaurant.delete({
        where: {
          id: restaurantId,
        },
      });
    } catch (error) {
      throw new PrismaException(error);
    }
  }
}
