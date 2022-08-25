import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Admin, Prisma } from '@prisma/client';
import { AdminService } from '../admin/admin.service';
import { PrismaException } from '../exception/Prisma.exception';
import { S3 } from 'aws-sdk';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class RestaurantService {
  constructor(
    private prisma: PrismaService,
    private readonly authService: AuthService,
  ) {}

  async findRestaurantByEmail(email: string) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { email },
    });
    if (!restaurant) throw new BadRequestException('restaurant not found');
    return restaurant;
  }

  async createRestaurant(
    uploadedImages: S3.ManagedUpload.SendData[],
    details: Prisma.RestaurantCreateInput,
  ) {
    const isExist = await this.prisma.restaurant.findFirst({
      where: {
        OR: { restaurantName: details.restaurantName, email: details.email },
      },
    });
    if (isExist)
      throw new ConflictException(
        `Restaurant name ${details.restaurantName} is already exist`,
      );
    details.password = await this.authService.hashPassword(details.password);
    const newRestaurant = await this.prisma.restaurant.create({
      data: {
        ...details,
        restaurantImage: uploadedImages.map((image) => image.Location),
      },
      select: { password: false },
    });

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
      include: { menu: true, table: true },
    });
    return restaurant;
  }

  async findAllRestaurant() {
    return await this.prisma.restaurant.findMany();
  }

  async updateRestaurantInfo(
    restaurantId: string,
    details: Prisma.RestaurantUpdateInput,
    uploadedImages: S3.ManagedUpload.SendData[],
  ) {
    if (details.restaurantName) {
      const isExist = await this.findRestaurantByName(
        <string>details.restaurantName,
      );
      if (isExist)
        throw new BadRequestException('Your restaurant name already exist');
    }
    if (details.password) {
      details.password = await this.authService.hashPassword(
        <string>details.password,
      );
    }
    const updatedRestaurant = await this.prisma.restaurant.update({
      data: {
        ...details,
        restaurantImage: uploadedImages.map((image) => image.Location),
        updatedAt: new Date(),
      },
      where: { id: restaurantId },
    });
    delete updatedRestaurant.password;
    return updatedRestaurant;
  }

  async findRestaurantByName(restaurantName: string) {
    return await this.prisma.restaurant.findUnique({
      where: { restaurantName: restaurantName },
    });
  }

  async deleteRestaurantById(restaurantId: string) {
    try {
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
