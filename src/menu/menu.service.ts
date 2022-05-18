import { Injectable } from '@nestjs/common';
import { Admin, Menu, Prisma } from '@prisma/client';
import { PrismaException } from 'src/exception/Prisma.exception';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateMenuList } from './dto/CreateMenuList.dto';

@Injectable()
export class MenuService {
  constructor(private readonly prisma: PrismaService) {}
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

  async findMenuById(menuId: string) {
    try {
      return await this.prisma.menu.findUnique({
        where: { id: menuId },
      });
    } catch (error) {
      throw new PrismaException(error);
    }
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
