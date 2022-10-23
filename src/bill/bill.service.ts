import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class BillService {
  constructor(private readonly prisma: PrismaService) {}

  async createBill(billData: Prisma.BillCreateInput) {
    return await this.prisma.bill.create({
      data: { ...billData },
    });
  }

  async findBillById(id: string) {
    return await this.prisma.bill.findUnique({
      where: { id: id },
    });
  }

  async updateBillById(id: string, updateBillData: Prisma.BillUpdateInput) {
    return await this.prisma.bill.update({
      data: { ...updateBillData },
      where: { id },
    });
  }
}
