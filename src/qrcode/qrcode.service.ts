import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQrcodeInput } from './dto/CreateQrcodeInput';
import { v4 as uuidv4 } from 'uuid';
import { Prisma } from '@prisma/client';
import { QrcodeSize } from '../restaurant/dto/qrcode/QrcodeSize.dto';
import { PrismaException } from 'src/exception/Prisma.exception';

@Injectable()
export class QrcodeService {
  constructor(private readonly prisma: PrismaService) {}

  async generateQrcode(tableDetail: CreateQrcodeInput) {
    const existRestaurant = await this.prisma.restaurant.findUnique({
      where: { id: tableDetail.restaurantId },
    });
    if (!existRestaurant)
      throw new NotFoundException(
        `restaurant id : ${tableDetail.restaurantId} not found`,
      );
    const existQrcode = await this.prisma.qrcode.findFirst({
      where: {
        tableName: tableDetail.tableName,
        restaurantId: tableDetail.restaurantId,
      },
    });
    if (existQrcode) {
      return {
        isSuccess: false,
        qrcode: existQrcode,
      };
    }
    const tableToken = this.generateTableToken();
    const newQrcode = await this.prisma.qrcode.create({
      data: {
        qrcodeImageUrl: this.generateQrcodeImageUrl(
          tableToken,
          tableDetail.qrcodeSize,
        ),
        tableName: tableDetail.tableName,
        tableToken,
        restaurantId: tableDetail.restaurantId,
      },
    });
    return {
      isSuccess: true,
      qrcode: newQrcode,
    };
  }

  async findQrcodeByTableToken(tableToken: string) {
    const table = await this.prisma.qrcode.findFirst({
      where: { tableToken },
    });
    if (!table) throw new NotFoundException(`table not found`);
    return table;
  }
  private generateQrcodeImageUrl(
    tableToken: string,
    { height, width }: QrcodeSize,
  ) {
    return `http://api.qrserver.com/v1/create-qr-code/?data=${process.env.FRONTEND_URL}/${tableToken}!&size=${width}x${height}`;
  }

  private generateTableToken() {
    return uuidv4();
  }

  async deleteQrcodeByTableNameAndRestaurantId(
    target: Prisma.QrcodeTableNameRestaurantIdCompoundUniqueInput,
  ) {
    try {
      await this.prisma.qrcode.delete({
        where: {
          tableName_restaurantId: {
            restaurantId: target.restaurantId,
            tableName: target.tableName,
          },
        },
      });
    } catch (error) {
      throw new PrismaException(error.meta.cause);
    }
  }

  async findQrcodeListByRestaurantId(restaurantId: string) {
    const qrcodeList = await this.prisma.qrcode.findMany({
      where: { restaurantId },
    });
    return qrcodeList;
  }
}
