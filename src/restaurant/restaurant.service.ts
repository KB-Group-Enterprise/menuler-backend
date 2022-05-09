import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { QrcodeService } from '../qrcode/qrcode.service';
import { CreateQrcodeInput } from '../qrcode/dto/CreateQrcodeInput';
import { Table } from './interfaces/table';

@Injectable()
export class RestaurantService {
  constructor(
    private prisma: PrismaService,
    private readonly qrcodeService: QrcodeService,
  ) {}

  async createRestaurant(details: Prisma.RestaurantCreateInput) {
    const isExist = await this.prisma.restaurant.findUnique({
      where: { restaurantName: details.restaurantName },
    });
    if (isExist)
      throw new ConflictException({
        message: `Restaurant name ${details.restaurantName} is already exist`,
      });
    const newRestaurant = await this.prisma.restaurant.create({
      data: { ...details },
    });
    return newRestaurant;
  }

  async insertTable(tableList: Table[]) {
    // TODO findRestaurantId
    const restaurantId = '627100646e64e68312ef5833';
    tableList.forEach(async (table) => {
      const qrcodeInput: CreateQrcodeInput = {
        restaurantId,
        tableName: table.tableName,
      };
      await this.qrcodeService.generateQrcode(qrcodeInput);
    });
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
