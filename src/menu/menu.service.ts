import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { Admin, Prisma } from '@prisma/client';
import { S3 } from 'aws-sdk';
import { PrismaException } from 'src/exception/Prisma.exception';
import { FoodOrderInput } from 'src/order/dto/FoodOrderInput.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateMenuDto } from './dto/CreateMenu.dto';

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

  async addMenu(
    menuDto: CreateMenuDto,
    uploadedImage: S3.ManagedUpload.SendData[],
    admin: Admin,
  ) {
    const { category, foodName, price, description, menuStatus } = menuDto;
    const isMenuExist = await this.checkExistMenu(foodName, admin.restaurantId);
    if (isMenuExist) throw new ConflictException('menu name is exist');
    const createdMenu = await this.prisma.menu.create({
      data: {
        category,
        foodName,
        price: Number(price),
        description,
        menuStatus,
        imageUrl: uploadedImage[0].Location,
        restaurantId: admin.restaurantId,
      },
    });
    return createdMenu;
  }

  async updateMenu(
    menuId: string,
    details: Prisma.MenuUpdateInput,
    uploadedImage: S3.ManagedUpload.SendData[],
    admin: Admin,
  ) {
    const additional: any = {};

    if (uploadedImage[0]) {
      additional.imageUrl = uploadedImage[0].Location;
    }
    delete details['menuImage'];
    const updatedMenu = await this.prisma.menu.update({
      data: {
        ...details,
        updatedAt: new Date(),
        price: Number(details.price),
        ...additional,
      },
      where: {
        restaurantId_id: {
          id: menuId,
          restaurantId: admin.restaurantId,
        },
      },
    });
    return updatedMenu;
  }

  async findAllMenuByRestaurantId(restaurantId: string) {
    if (!restaurantId) throw new BadRequestException('restaurant Id invalid');
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

  async validateMenuList(foodOrders: FoodOrderInput[]) {
    if (!foodOrders?.length)
      throw new BadRequestException('foodOrders must be an array');
    const menuPromiseArr = foodOrders.map((foodOrder) =>
      this.validateMenu(foodOrder),
    );
    try {
      return await Promise.all([...menuPromiseArr]);
    } catch (error) {
      throw new BadRequestException('validate menu list failed');
    }
  }

  async validateMenu(foodOrder: FoodOrderInput) {
    const validatedMenu = await this.findMenuById(foodOrder.menuId);
    if (!validatedMenu)
      throw new BadRequestException('this menu does not exist');
    if (validatedMenu.menuStatus === 'CANCEL')
      throw new BadRequestException('this menu has been cancel');
    return validatedMenu;
  }
}
