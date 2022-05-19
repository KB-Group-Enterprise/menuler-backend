import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Admin, Prisma, Qrcode } from '@prisma/client';
import { QrcodeService } from '../qrcode/qrcode.service';
import { CreateQrcodeInput } from '../qrcode/dto/CreateQrcodeInput';
import { AdminService } from '../admin/admin.service';
import { TableInput } from './dto/qrcode/TableInput.dto';
import { PrismaException } from '../exception/Prisma.exception';

@Injectable()
export class RestaurantService {
  constructor(
    private prisma: PrismaService,
    private readonly qrcodeService: QrcodeService,
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
