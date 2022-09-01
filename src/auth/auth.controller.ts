import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { Admin } from '@prisma/client';
import { AuthService } from './auth.service';
import { CurrentUser } from './current-user';
import { Roles } from './decorators/roles.decorator';
import { CredentialInput } from './dto/Credential.dto';
import { ROLE_LIST } from './enums/role-list.enum';
import { JwtAdminAuthGuard } from './guards/jwt-admin.guard';
import { RoleGuard } from './guards/role.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/admin/login')
  async loginAdmin(@Body() credential: CredentialInput) {
    const { accessToken } = await this.authService.loginAdmin(credential);
    return { data: { accessToken }, message: 'login success' };
  }
}
