import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQrcodeInput } from './dto/CreateQrcodeInput';
import { v4 as uuidv4 } from 'uuid';
import { Admin, Prisma, Table } from '@prisma/client';
import { QrcodeSize } from '../restaurant/dto/qrcode/QrcodeSize.dto';
import { PrismaException } from 'src/exception/Prisma.exception';
import { TableInput } from 'src/restaurant/dto/qrcode/TableInput.dto';

@Injectable()
export class TableService {
  constructor(private readonly prisma: PrismaService) {}

  async generateQrcode(tableDetail: CreateQrcodeInput) {
    const existRestaurant = await this.prisma.restaurant.findUnique({
      where: { id: tableDetail.restaurantId },
    });
    if (!existRestaurant)
      throw new NotFoundException(
        `restaurant id : ${tableDetail.restaurantId} not found`,
      );
    const existQrcode = await this.prisma.table.findFirst({
      where: {
        tableName: tableDetail.tableName,
        restaurantId: tableDetail.restaurantId,
      },
    });
    if (existQrcode) {
      return {
        isSuccess: false,
        table: existQrcode,
      };
    }
    const tableToken = this.generateTableToken();
    const newQrcode = await this.prisma.table.create({
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
      table: newQrcode,
    };
  }

  async findTableByTableToken(tableToken: string) {
    const table = await this.prisma.table.findFirst({
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

  async deleteTableByTableNameAndRestaurantId(
    target: Prisma.TableTableNameRestaurantIdCompoundUniqueInput,
  ) {
    try {
      await this.prisma.table.delete({
        where: {
          tableName_restaurantId: {
            restaurantId: target.restaurantId,
            tableName: target.tableName,
          },
        },
      });
    } catch (error) {
      throw new PrismaException(error);
    }
  }

  async findTableListByRestaurantId(restaurantId: string) {
    const tableList = await this.prisma.table.findMany({
      where: { restaurantId },
    });
    return tableList;
  }

  async insertTable(admin: Admin, tableList: TableInput[]) {
    const qrcodeSuccessList: Table[] = [];
    const qrcodeFailList: { tableName: string }[] = [];
    for (const tableRequest of tableList) {
      const qrcodeInput: CreateQrcodeInput = {
        restaurantId: admin.restaurantId,
        tableName: tableRequest.tableName,
        qrcodeSize: tableRequest.qrcodeSize,
      };
      const { isSuccess, table } = await this.generateQrcode(qrcodeInput);
      if (isSuccess) {
        qrcodeSuccessList.push(table);
      } else {
        qrcodeFailList.push({ tableName: table.tableName });
      }
    }
    return {
      qrcodeSuccessList,
      qrcodeFailList,
    };
  }
}
