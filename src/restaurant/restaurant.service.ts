import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Admin, Menu, Prisma, Qrcode } from '@prisma/client';
import { QrcodeService } from '../qrcode/qrcode.service';
import { CreateQrcodeInput } from '../qrcode/dto/CreateQrcodeInput';
import { AdminService } from '../admin/admin.service';
import { CreateMenuList } from './dto/menu/CreateMenuList.dto';
import { TableInput } from './dto/qrcode/TableInput.dto';
import { PrismaException } from '../exception/Prisma.exception';

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

  async insertTable(admin: Admin, tableList: TableInput[]) {
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
      throw new PrismaException(error);
    }
  }

  async checkExistMenu(foodName: string, restaurantId: string) {
    const existMenu = await this.prisma.menu.findUnique({
      where: {
        restaurantId_foodName: {
          foodName,
          restaurantId,
        },
      },
    });
    return existMenu ? true : false;
  }

  async addMenu({ menuList }: CreateMenuList, imageUrl: string, admin: Admin) {
    const menuSuccessList: Menu[] = [];
    const menuConflictList: { foodName: string }[] = [];
    for (const menu of menuList) {
      const { category, foodName, price, description, isAvailable } = menu;
      const isMenuExist = await this.checkExistMenu(
        foodName,
        admin.restaurantId,
      );
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

  async updateMenu(
    menuId: string,
    details: Prisma.MenuUpdateInput,
    imageUrl: string,
    admin: Admin,
  ) {
    try {
      const updatedMenu = await this.prisma.menu.update({
        data: { ...details, updatedAt: new Date(), imageUrl },
        where: {
          restaurantId_id: {
            id: menuId,
            restaurantId: admin.restaurantId,
          },
        },
      });
      return updatedMenu;
    } catch (error) {
      throw new PrismaException(error);
    }
  }

  async findAllMenuByRestaurantId(restaurantId: string) {
    const { menu } = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId },
      include: { menu: true },
    });
    return menu;
  }

  async findRestaurantById(restaurantId: string) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: {
        id: restaurantId,
      },
      include: { menu: true, qrcode: true, admin: true },
    });
    return restaurant;
  }

  async findMenuById(menuId: string) {
    return await this.prisma.menu.findUnique({
      where: { id: menuId },
    });
  }

  async deleteMenu(menuId: string, admin: Admin) {
    try {
      await this.prisma.menu.delete({
        where: {
          restaurantId_id: {
            id: menuId,
            restaurantId: admin.restaurantId,
          },
        },
      });
    } catch (error) {
      throw new PrismaException(error);
    }
  }
}
