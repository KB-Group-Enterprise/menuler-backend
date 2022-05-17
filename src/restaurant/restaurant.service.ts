import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Admin, Prisma, Qrcode } from '@prisma/client';
import { QrcodeService } from '../qrcode/qrcode.service';
import { CreateQrcodeInput } from '../qrcode/dto/CreateQrcodeInput';
import { Table } from './interfaces/table';
import { AdminService } from 'src/admin/admin.service';

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
}
