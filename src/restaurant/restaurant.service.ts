import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Menu, Prisma } from '@prisma/client';
import { PrismaException } from '../exception/Prisma.exception';
import { S3 } from 'aws-sdk';
import { AuthService } from 'src/auth/auth.service';
import { CreateRestaurantInput } from './dto/restaurant/CreateRestaurantInput';
import { ROLE_LIST } from 'src/auth/enums/role-list.enum';
import { FoodOrder } from 'src/order/types/FoodOrder';
import * as _ from 'lodash';
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
      additional.restaurantImage = uploadedImages.map(
        (image) => image.Location,
      );
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

  async getRestaurantSummary(restaurantId: string, query: any) {
    // number of order completed
    // leaderboard for most menu ordered

    const findManyArgs: Prisma.OrderFindManyArgs = {
      where: { restaurantId },
      include: { foodOrderList: { include: { menu: true } } },
    };
    if (query.startDate && query.endDate) {
      const startDate = new Date(query.startDate);
      const endDate = new Date(query.endDate);
      findManyArgs.where.createAt = { gte: startDate, lte: endDate };
    }

    const orders = await this.prisma.order.findMany(findManyArgs);
    const totalOrderCount = orders.length;
    // console.log(orders)
    const foodOrdersLists: FoodOrder[] = orders
      .map((i: any) => i.foodOrderList)
      .flat(1) as any;
    // console.log(foodOrdersLists);
    const menus: Menu[] = foodOrdersLists.map((i: any) => i.menu);
    const totalMenuCount = menus.length;
    const totalSales = menus.reduce((r, v) => {
      return r + v.price;
    }, 0);
    // console.log(menus);
    // income produced by using the apps
    const menuGroupby = _.groupBy(menus, 'foodName');
    // console.log(menuGroupby);
    let leaderBoard: {
      foodName: string;
      price: number;
      sales: number;
      income: number;
      category: string;
    }[] = [];

    Object.keys(menuGroupby).forEach((i) => {
      const menuItems = menuGroupby[i];
      const sales = menuItems.length;
      const menuItem = menuItems[0];
      if (!menuItem) return;
      const foodName = menuItem.foodName;
      const price = menuItem.price;
      const income = +(sales * price).toFixed(2);
      leaderBoard.push({
        foodName,
        price,
        sales,
        income,
        category: menuItem.category,
      });
    });

    leaderBoard = leaderBoard.sort((a, b) => {
      return b.sales - a.sales;
    });

    const topTen = leaderBoard.slice(0, 9);

    // console.log(leaderBoard);
    // console.log(topTen);
    // console.log({ totalOrderCount });

    return {
      leaderBoard,
      topTen,
      total: {
        totalMenuCount,
        totalOrderCount,
      },
    };
  }
}
