import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { Admin } from '@prisma/client';
import { AuthService } from './auth.service';
import { CurrentUser } from './current-user';
import { CredentialInput } from './dto/Credential.dto';
import { JwtAdminAuthGuard } from './guards/jwt-admin.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/restaurant/login')
  async loginRestaurant(@Body() credential: CredentialInput) {
    const { accessToken } = await this.authService.loginRestaurant(credential);
    return { data: { accessToken }, message: 'login success' };
  }

  @Post('/admin/login')
  async loginAdmin(@Body() credential: CredentialInput) {
    const { accessToken } = await this.authService.loginAdmin(credential);
    return { data: { accessToken }, message: 'login success' };
  }

  @Get('/admin/profile')
  @UseGuards(JwtAdminAuthGuard)
  async adminProfile(@CurrentUser() admin: Admin) {
    const data = await this.authService.getProfile(admin);
    return {
      data,
    };
  }

  @Get('/secret')
  @UseGuards(JwtAdminAuthGuard)
  async getSecret(@CurrentUser() admin: Admin) {
    return {
      data: {
        admin,
      },
      message: 'secret message',
    };
  }
}
