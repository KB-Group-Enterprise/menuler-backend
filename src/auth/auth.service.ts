import {
  forwardRef,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AdminService } from '../admin/admin.service';
import { CredentialInput } from './dto/Credential.dto';
import { RegisterAdminInput } from '../restaurant/dto/restaurant/RegisterAdmin.dto';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Admin } from '@prisma/client';
import { RestaurantService } from 'src/restaurant/restaurant.service';
@Injectable()
export class AuthService {
  constructor(
    private readonly adminService: AdminService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    @Inject(forwardRef(() => RestaurantService))
    private readonly restaurantService: RestaurantService,
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

  async loginRestaurant(data: CredentialInput) {
    const restaurant = await this.restaurantService.findRestaurantByEmail(
      data.email,
    );
    const isPasswordValid = await this.verifyPassword(
      data.password,
      restaurant.password,
    );
    if (!isPasswordValid)
      throw new UnauthorizedException('email or password wrong');
    const accessToken = await this.generateAccessToken(
      restaurant.id,
      restaurant.email,
    );
    return { accessToken };
  }

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

  async getProfile(admin: Admin) {
    const result = await this.adminService.adminProfile(admin.id);
    return result;
  }

  // TODO refreshToken
}
