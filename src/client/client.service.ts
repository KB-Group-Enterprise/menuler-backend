import { Injectable } from '@nestjs/common';
import { Client, ClientGroup, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ClientService {
  constructor(private readonly prisma: PrismaService) {}

  async findClientById(id: string) {
    return await this.prisma.client.findUnique({
      where: { id },
      include: { clientGroup: true },
    });
  }

  async findClientOrCreate(clientData: Prisma.ClientCreateInput, id?: string) {
    let client;
    if (!id) {
      client = await this.createClient(clientData);
      return client;
    }
    client = await this.findClientById(id);
    if (
      !client ||
      (client as Client & { clientGroup: ClientGroup })?.clientGroup?.status ===
        'COMPLETED'
    ) {
      client = await this.createClient(clientData);
      return client;
    }
    client = await this.updateClientById(client.id, {
      status: 'ONLINE',
      clientGroup: clientData.clientGroup,
    });
    return client;
  }

  async createClient(clientData: Prisma.ClientCreateInput) {
    return await this.prisma.client.create({
      data: { ...clientData },
    });
  }

  async updateClientById(
    clientId: string,
    updateClient: Prisma.ClientUpdateInput,
  ) {
    return await this.prisma.client.update({
      data: { ...updateClient },
      where: { id: clientId },
    });
  }

  async deleteClientById(clientId: string) {
    return await this.prisma.client.delete({
      where: { id: clientId },
    });
  }
}
