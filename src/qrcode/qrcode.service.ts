import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQrcodeInput } from './dto/CreateQrcodeInput';
import { v4 as uuidv4 } from 'uuid';
import { Prisma } from '@prisma/client';

@Injectable()
export class QrcodeService {
  constructor(private readonly prisma: PrismaService) {}

  async generateQrcode(tableDetail: CreateQrcodeInput) {
    const isExist = await this.prisma.qrcode.findFirst({
      where: {
        tableName: tableDetail.tableName,
        restaurantId: tableDetail.restaurantId,
      },
    });
    if (isExist)
      throw new ConflictException(
        `table name ${tableDetail.tableName} is already exist`,
      );
    const tableToken = this.generateTableToken();
    const newQrcode = await this.prisma.qrcode.create({
      data: {
        qrcodeImageUrl: this.generateQrcodeImageUrl(tableToken),
        tableName: tableDetail.tableName,
        tableToken,
        restaurantId: tableDetail.restaurantId,
      },
    });
    return newQrcode;
  }

  async findQrcodeByTableToken(tableToken: string) {
    const table = await this.prisma.qrcode.findFirst({
      where: { tableToken },
    });
    if (!table) throw new NotFoundException(`table not found`);
    return table;
  }
  private generateQrcodeImageUrl(tableToken: string) {
    return `http://api.qrserver.com/v1/create-qr-code/?data=${process.env.FRONTEND_URL}/${tableToken}!&size=400x400`;
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
      if (error.code === 'P2025')
        throw new BadRequestException(error.meta.cause);
    }
  }
}
