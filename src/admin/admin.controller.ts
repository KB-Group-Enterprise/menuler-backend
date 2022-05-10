import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { Admin } from '@prisma/client';
import { CurrentUser } from 'src/auth/current-user';
import { JwtAdminAuthGuard } from 'src/auth/guards/jwt.guard';
import { CreateRestaurantInput } from 'src/restaurant/dto/CreateRestaurantInput';
import { CreateTableRequest } from 'src/restaurant/dto/CreateTableRequest';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('/restaurant')
  @UseGuards(JwtAdminAuthGuard)
  async createRestaurant(
    @Body() restaurantDetails: CreateRestaurantInput,
    @CurrentUser() admin: Admin,
  ) {
    const restaurant = await this.adminService.createRestaurant(
      admin.id,
      restaurantDetails,
    );
    return {
      data: { restaurant },
      message: 'generate restaurant success',
    };
  }

  @Post('/table')
  @UseGuards(JwtAdminAuthGuard)
  async createTable(
    @Body() { tables }: CreateTableRequest,
    @CurrentUser() admin: Admin,
  ) {
    const { qrcodeFailList, qrcodeSuccessList } =
      await this.adminService.insertTable(admin.id, tables);
    return {
      data: {
        success: qrcodeSuccessList,
        conflict: qrcodeFailList,
      },
    };
  }
}
