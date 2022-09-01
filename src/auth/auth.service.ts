import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AdminService } from '../admin/admin.service';
import { CredentialInput } from './dto/Credential.dto';
import { RegisterAdminInput } from '../restaurant/dto/restaurant/RegisterAdmin.dto';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
@Injectable()
export class AuthService {
  constructor(
    private readonly adminService: AdminService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async registerAdmin(restaurantId: string, data: RegisterAdminInput) {
    data.password = await this.hashPassword(data.password);
    const admin = await this.adminService.createAdmin(restaurantId, data);
    return admin;
  }

  async loginAdmin(data: CredentialInput) {
    const admin = await this.adminService.findAdminByEmail(data.email);
    const isPasswordValid = await this.verifyPassword(
      data.password,
      admin.password,
    );
    if (!isPasswordValid)
      throw new UnauthorizedException('email or password wrong');
    const accessToken = await this.generateAccessToken(admin.id, admin.email);
    return { accessToken };
  }

  // async loginRestaurant(data: CredentialInput) {
  //   const restaurant = await this.restaurantService.findRestaurantByEmail(
  //     data.email,
  //   );
  //   const isPasswordValid = await this.verifyPassword(
  //     data.password,
  //     restaurant.password,
  //   );
  //   if (!isPasswordValid)
  //     throw new UnauthorizedException('email or password wrong');
  //   const accessToken = await this.generateAccessToken(
  //     restaurant.id,
  //     restaurant.email,
  //   );
  //   return { accessToken };
  // }

  async hashPassword(password: string) {
    return await bcrypt.hash(password, 10);
  }

  async verifyPassword(password: string, hashedPassword: string) {
    return await bcrypt.compare(password, hashedPassword);
  }

  async generateAccessToken(id: string, email: string) {
    return await this.jwtService.signAsync(
      { sub: id, email },
      {
        secret: this.configService.get('JWT_ACCESS_SECRET'),
        expiresIn: '60m',
      },
    );
  }

  async findRoleByKey(key: string) {
    try {
      return await this.prisma.role.findFirst({
        where: { key },
      });
    } catch (error) {
      throw new BadRequestException('role invalid');
    }
  }

  verifyAccessToken(accessToken: string): { sub: string; email: string } {
    return this.jwtService.decode(accessToken) as any;
  }

  // TODO refreshToken
}
