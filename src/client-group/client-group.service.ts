import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ClientGroupService {
  constructor(private readonly prismaService: PrismaService) {}

  async createClientGroup(createData: Prisma.ClientGroupCreateInput) {
    return await this.prismaService.clientGroup.create({
      data: {
        ...createData,
      },
      include: { client: true },
    });
  }

  async findClientGroupById(clientGroupId: string) {
    return await this.prismaService.clientGroup.findUnique({
      where: { id: clientGroupId },
      include: { order: true },
    });
  }

  async updateClientGroupById(
    clientGroupId: string,
    updateData: Prisma.ClientGroupUpdateInput,
  ) {
    return await this.prismaService.clientGroup.update({
      where: {
        id: clientGroupId,
      },
      data: { ...updateData },
      include: { client: true },
    });
  }
}
