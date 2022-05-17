import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { Admin } from '@prisma/client';
import { CurrentUser } from 'src/auth/current-user';
import { JwtAdminAuthGuard } from 'src/auth/guards/jwt.guard';
import { CreateMenuDto } from './dto/CreateMenu.dto';
import { CreateMenuList } from './dto/CreateMenuList.dto';
import { CreateRestaurantInput } from './dto/CreateRestaurantInput';
import { CreateTableRequest } from './dto/CreateTableRequest';
import { RestaurantService } from './restaurant.service';

@Controller('restaurant')
export class RestaurantController {
  constructor(private restaurantService: RestaurantService) {}

  @Post('/')
  @UseGuards(JwtAdminAuthGuard)
  async createRestaurant(
    @Body() restaurantDetails: CreateRestaurantInput,
    @CurrentUser() admin: Admin,
  ) {
    const restaurant = await this.restaurantService.createRestaurant(
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
      await this.restaurantService.insertTable(admin, tables);
    return {
      data: {
        success: qrcodeSuccessList,
        conflict: qrcodeFailList,
      },
    };
  }

  @Post('/menu')
  @UseGuards(JwtAdminAuthGuard)
  async insertMenu(
    @Body() menuList: CreateMenuList,
    @CurrentUser() admin: Admin,
  ) {
    // TODO imageUrl
    const imageUrl = 'mockUrl';
    const { menuConflictList, menuSuccessList } =
      await this.restaurantService.addMenu(menuList, imageUrl, admin);
    return {
      data: {
        success: menuSuccessList,
        conflict: menuConflictList,
      },
    };
  }
}
