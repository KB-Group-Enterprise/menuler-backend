import { Controller, Get, UseGuards } from '@nestjs/common';
import { Admin } from '@prisma/client';
import { CurrentUser } from 'src/auth/current-user';
import { JwtAdminAuthGuard } from 'src/auth/guards/jwt-admin.guard';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}
  @Get('/profile')
  @UseGuards(JwtAdminAuthGuard)
  async adminProfile(@CurrentUser() admin: Admin) {
    const data = await this.adminService.getAdminProfile(admin.id);
    return {
      data,
    };
  }
}
