import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';
import { Admin, Prisma, Table } from '@prisma/client';
import { QrcodeSize } from './dto/QrcodeSize.dto';
import { PrismaException } from 'src/exception/Prisma.exception';
import { TableInput } from './dto/TableInput.dto';
import { UpdateTableInput } from './dto/UpdateTableInput';

@Injectable()
export class TableService {
  constructor(private readonly prisma: PrismaService) {}

  async generateQrcode(restaurantId: string, tableDetail: TableInput) {
    const existRestaurant = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });
    if (!existRestaurant)
      throw new NotFoundException(`restaurant id : ${restaurantId} not found`);
    const existQrcode = await this.prisma.table.findFirst({
      where: {
        tableName: tableDetail.tableName,
        restaurantId: restaurantId,
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
        restaurantId: restaurantId,
      },
    });
    return {
      isSuccess: true,
      table: newQrcode,
    };
  }

  async findTableByTableToken(tableToken: string) {
    const table = await this.prisma.table.findUnique({
      where: { tableToken },
      include: { order: true, clientGroup: true, restaurant: true },
    });
    return table;
  }

  private generateQrcodeImageUrl(
    tableToken: string,
    { height, width }: QrcodeSize,
  ) {
    return `http://api.qrserver.com/v1/create-qr-code/?data=${process.env.FRONTEND_URL}/customer/menu/${tableToken}&size=${width}x${height}`;
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
      const qrcodeInput: TableInput = {
        tableName: tableRequest.tableName,
        qrcodeSize: tableRequest.qrcodeSize,
      };
      const { isSuccess, table } = await this.generateQrcode(
        admin.restaurantId,
        qrcodeInput,
      );
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

  async findAllTableByRestaurantId(restaurantId: string) {
    const tables = await this.prisma.table.findMany({
      where: { restaurantId },
    });
    return tables;
  }

  async findTableById(tableId: string) {
    const table = await this.prisma.table.findUnique({
      where: { id: tableId },
      include: { order: true, clientGroup: true },
    });
    return table;
  }

  async updateTable(tableId: string, details: UpdateTableInput, admin: Admin) {
    try {
      const table = await this.prisma.table.update({
        data: { ...details },
        where: {
          id_restaurantId: {
            id: tableId,
            restaurantId: admin.restaurantId,
          },
        },
      });
      return table;
    } catch (error) {
      throw new PrismaException(error);
    }
  }

  async deleteTable(tableId: string, admin: Admin) {
    try {
      await this.prisma.table.delete({
        where: {
          id_restaurantId: {
            id: tableId,
            restaurantId: admin.restaurantId,
          },
        },
      });
    } catch (error) {
      throw new PrismaException(error);
    }
  }

  async updateTableById(tableId: string, details: Prisma.TableUpdateInput) {
    return await this.prisma.table.update({
      where: {
        id: tableId,
      },
      data: {
        ...details,
      },
    });
  }
}
