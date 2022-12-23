import { BadRequestException, Injectable } from '@nestjs/common';
import { Admin } from '@prisma/client';
import { S3 } from 'aws-sdk';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBankAccountDto } from './dto/create-bank-account.dto';
import { UpdateBankAccountDto } from './dto/update-bank-account.dto';

@Injectable()
export class BankAccountService {
  constructor(private prisma: PrismaService) {}

  async createBankAccount(
    admin: Admin,
    bankAccountDto: CreateBankAccountDto,
    images?: S3.ManagedUpload.SendData[],
  ) {
    let imageUrl: string | undefined;
    if (images?.length) {
      imageUrl = images[0].Location;
    }
    return await this.prisma.bankAccount.create({
      data: {
        ...bankAccountDto,
        imageUrl: imageUrl,
        restaurantId: admin.restaurantId,
      },
    });
  }

  async updateBankAccount(
    id: string,
    bankAccountDto: UpdateBankAccountDto,
    images?: S3.ManagedUpload.SendData[],
  ) {
    let imageUrl: string | undefined;
    if (images?.length) {
      imageUrl = images[0].Location;
    }
    return await this.prisma.bankAccount.update({
      data: {
        ...bankAccountDto,
        imageUrl: imageUrl,
      },
      where: { id },
    });
  }

  async findBankAccountById(id: string) {
    return await this.prisma.bankAccount.findUnique({ where: { id } });
  }

  async deleteBankAccountById(id: string) {
    return await this.prisma.bankAccount.delete({ where: { id } });
  }

  async findAllBankAccountsByRestaurantId(id: string) {
    return await this.prisma.bankAccount.findMany({
      where: { restaurantId: id },
    });
  }
}
