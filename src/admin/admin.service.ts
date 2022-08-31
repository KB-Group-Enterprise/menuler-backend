import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterAdminInput } from '../restaurant/dto/restaurant/RegisterAdmin.dto';
import { PrismaException } from 'src/exception/Prisma.exception';
@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async createAdmin(restaurantId: string, detail: RegisterAdminInput) {
    const isAdminExist = await this.prisma.admin.findUnique({
      where: { email: detail.email },
    });
    if (isAdminExist)
      throw new ConflictException(`email ${detail.email} already exist`);
    const staffRole = await this.prisma.role.findFirst({
      where: { key: 'STAFF' },
    });
    if (!staffRole) throw new BadRequestException('Can not find role');
    const admin = await this.prisma.admin.create({
      data: {
        firstname: detail.firstname,
        lastname: detail.lastname,
        email: detail.email,
        password: detail.password,
        restaurant: { connect: { id: restaurantId } },
        role: { connect: { id: staffRole.id } },
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

  async deleteAdminByAdminId(adminId: string) {
    try {
      await this.prisma.admin.delete({
        where: { id: adminId },
      });
    } catch (error) {
      throw new PrismaException(error);
    }
  }

  async deleteAdminByEmail(email: string) {
    try {
      await this.prisma.admin.delete({
        where: { email },
      });
    } catch (error) {
      throw new PrismaException(error);
    }
  }
  async getAdminProfile(adminId: string) {
    return this.prisma.admin.findUnique({
      where: { id: adminId },
      select: {
        email: true,
        restaurant: {
          select: {
            id: true,
            restaurantName: true,
            isActivate: true,
            status: true,
            registerOn: true,
            location: true,
          },
        },
      },
    });
  }

  async findAllAdminByRestaurantId(restaurantId: string) {
    return await this.prisma.admin.findMany({
      where: { restaurantId },
      select: {
        password: false,
        email: true,
        firstname: true,
        id: true,
        lastname: true,
        restaurantId: true,
      },
    });
  }
}
