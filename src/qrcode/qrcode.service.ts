import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQrcodeInput } from './dto/CreateQrcodeInput';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class QrcodeService {
  constructor(private readonly prisma: PrismaService) {}

  async generateQrcode(tableDetail: CreateQrcodeInput) {
    // TODO checkExistTable
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
    return table;
  }
  private generateQrcodeImageUrl(tableToken: string) {
    return `http://api.qrserver.com/v1/create-qr-code/?data=${process.env.FRONTEND_URL}/${tableToken}!&size=100x100`;
  }

  private generateTableToken() {
    return uuidv4();
  }
}
