import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { PrismaException } from '../exception/Prisma.exception';
import { S3 } from 'aws-sdk';
import { AuthService } from 'src/auth/auth.service';
import { CreateRestaurantInput } from './dto/restaurant/CreateRestaurantInput';
import { ROLE_LIST } from 'src/auth/enums/role-list.enum';
@Injectable()
export class RestaurantService {
  constructor(
    private prisma: PrismaService,
    private readonly authService: AuthService,
  ) {}

  // async findRestaurantByEmail(email: string) {
  //   const restaurant = await this.prisma.restaurant.findUnique({
  //     where: { email },
  //   });
  //   if (!restaurant) throw new BadRequestException('restaurant not found');
  //   return restaurant;
  // }

  async createRestaurant(
    uploadedImages: S3.ManagedUpload.SendData[],
    details: CreateRestaurantInput,
  ) {
    const isExist = await this.prisma.restaurant.findUnique({
      where: { restaurantName: details.restaurantName },
    });
    if (isExist)
      throw new ConflictException(
        `Restaurant name ${details.restaurantName} is already exist`,
      );
    details.password = await this.authService.hashPassword(details.password);
    const role = await this.authService.findRoleByKey(ROLE_LIST.ROOT);
    const newRestaurant = await this.prisma.restaurant.create({
      data: {
        restaurantName: details.restaurantName,
        location: details.location,
        restaurantImage: uploadedImages.map((image) => image.Location),
        admin: {
          create: {
            email: details.email,
            firstname: details.firstname,
            lastname: details.lastname,
            password: details.password,
            roleId: role.id,
          },
        },
      },
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
    // if (details.restaurantName) {
    //   const isExist = await this.findRestaurantByName(
    //     <string>details.restaurantName,
    //   );
    //   if (isExist)
    //     throw new BadRequestException('Your restaurant name already exist');
    // }
    const additional = {} as any;
    if (uploadedImages.length) {
      additional.restaurantImage = uploadedImages.map((image) => image.Location);
    }

    const updatedRestaurant = await this.prisma.restaurant.update({
      data: {
        ...details,
        updatedAt: new Date(),
        ...additional,
      },
      where: { id: restaurantId },
    });
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
