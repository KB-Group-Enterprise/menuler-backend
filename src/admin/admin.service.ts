import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterAdminInput } from '../auth/dto/RegisterAdmin.dto';
@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async createAdmin(detail: RegisterAdminInput) {
    const isAdminExist = await this.prisma.admin.findUnique({
      where: { email: detail.email },
    });
    if (isAdminExist)
      throw new ConflictException(`email ${detail.email} already exist`);
    const admin = await this.prisma.admin.create({
      data: {
        email: detail.email,
        password: detail.password,
      },
    });
    return admin;
  }

  async updateAdminWithRestaurantId(adminId: string, restaurantId: string) {
    const updatedAdmin = await this.prisma.admin.update({
      where: { id: adminId },
      data: { restaurantId },
    });
    return updatedAdmin;
  }

  async findAdminByAdminId(adminId: string) {
    const admin = await this.prisma.admin.findUnique({
      where: { id: adminId },
    });
    if (!admin) throw new NotFoundException('user not found');
    return admin;
  }

  async findAdminByEmail(email: string) {
    const admin = await this.prisma.admin.findUnique({
      where: { email },
    });
    if (!admin) throw new NotFoundException('user not found');
    return admin;
  }

  async deleteAdminByEmail(email: string) {
    try {
      await this.prisma.admin.delete({
        where: { email },
      });
      // TODO delete qrcode of that restaurant
    } catch (error) {
      if (error.code === 'P2025')
        throw new BadRequestException(error.meta.cause);
    }
  }
}
