import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AdminService } from 'src/admin/admin.service';
import { CredentialInput } from './dto/Credential.dto';
import { RegisterAdminInput } from './dto/RegisterAdmin.dto';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
@Injectable()
export class AuthService {
  constructor(
    private readonly adminService: AdminService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async registerAdmin(data: RegisterAdminInput) {
    data.password = await this.hashPassword(data.password);
    const admin = await this.adminService.createAdmin(data);
    const accessToken = await this.generateAccessToken(admin.id, admin.email);
    return {
      admin,
      accessToken: accessToken,
    };
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

  private async hashPassword(password: string) {
    return await bcrypt.hash(password, 10);
  }

  private async verifyPassword(password: string, hashedPassword: string) {
    return await bcrypt.compare(password, hashedPassword);
  }

  private async generateAccessToken(adminId: string, email: string) {
    return await this.jwtService.signAsync(
      { sub: adminId, email },
      {
        secret: this.configService.get('JWT_ACCESS_SECRET'),
        expiresIn: '15m',
      },
    );
  }
}
