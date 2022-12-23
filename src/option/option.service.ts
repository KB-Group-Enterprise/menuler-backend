import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OptionService {
  constructor(private readonly prismaService: PrismaService) {}

  async createOption(optionData: Prisma.OptionCreateInput) {
    return await this.prismaService.option.create({
      data: { ...optionData },
      include: { menu: true },
    });
  }

  async updateOptionById(id: string, optionData: Prisma.OptionUpdateInput) {
    return await this.prismaService.option.update({
      data: { ...optionData },
      where: { id },
    });
  }

  async getOptionByOptionId(id: string) {
    return await this.prismaService.option.findUnique({
      where: { id },
      include: { menu: true },
    });
  }

  async deleteOptionByOptionId(id: string) {
    return await this.prismaService.option.delete({
      where: { id },
    });
  }
}
