import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Admin, Menu, Prisma, Qrcode } from '@prisma/client';
import { QrcodeService } from '../qrcode/qrcode.service';
import { CreateQrcodeInput } from '../qrcode/dto/CreateQrcodeInput';
import { Table } from './interfaces/table';
import { AdminService } from 'src/admin/admin.service';
import { CreateMenuList } from './dto/CreateMenuList.dto';

@Injectable()
export class RestaurantService {
  constructor(
    private prisma: PrismaService,
    private readonly qrcodeService: QrcodeService,
    private readonly adminService: AdminService,
  ) {}

  async createRestaurant(
    adminId: string,
    details: Prisma.RestaurantCreateInput,
  ) {
    const isExist = await this.prisma.restaurant.findUnique({
      where: { restaurantName: details.restaurantName },
    });
    if (isExist)
      throw new ConflictException(
        `Restaurant name ${details.restaurantName} is already exist`,
      );
    const newRestaurant = await this.prisma.restaurant.create({
      data: { ...details },
    });

    await this.adminService.updateAdminWithRestaurantId(
      adminId,
      newRestaurant.id,
    );
    return newRestaurant;
  }

  async insertTable(admin: Admin, tableList: Table[]) {
    const qrcodeSuccessList: Qrcode[] = [];
    const qrcodeFailList: { tableName: string }[] = [];
    for (const table of tableList) {
      const qrcodeInput: CreateQrcodeInput = {
        restaurantId: admin.restaurantId,
        tableName: table.tableName,
        qrcodeSize: table.qrcodeSize,
      };
      const { isSuccess, qrcode } = await this.qrcodeService.generateQrcode(
        qrcodeInput,
      );
      if (isSuccess) {
        qrcodeSuccessList.push(qrcode);
      } else {
        qrcodeFailList.push({ tableName: qrcode.tableName });
      }
    }
    return {
      qrcodeSuccessList,
      qrcodeFailList,
    };
  }

  async deleteRestaurant(restaurantName: string) {
    try {
      await this.prisma.restaurant.delete({
        where: { restaurantName },
      });
      // TODO delete qrcode of that restaurant
    } catch (error) {
      if (error.code === 'P2025')
        throw new BadRequestException(error.meta.cause);
    }
  }

  async checkExistMenu(foodName: string) {
    const existMenu = await this.prisma.menu.findFirst({
      where: { foodName },
    });
    return existMenu ? true : false;
  }

  async addMenu({ menuList }: CreateMenuList, imageUrl: string, admin: Admin) {
    const menuSuccessList: Menu[] = [];
    const menuConflictList: { foodName: string }[] = [];
    for (const menu of menuList) {
      const { category, foodName, price, description, isAvailable } = menu;
      const isMenuExist = await this.checkExistMenu(foodName);
      if (!isMenuExist) {
        const createdMenu = await this.prisma.menu.create({
          data: {
            category,
            foodName,
            price,
            description,
            isAvailable,
            imageUrl,
            restaurantId: admin.restaurantId,
          },
        });
        menuSuccessList.push(createdMenu);
      } else {
        menuConflictList.push({ foodName });
      }
    }
    return {
      menuSuccessList,
      menuConflictList,
    };
  }
}
