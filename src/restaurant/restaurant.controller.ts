import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { Admin } from '@prisma/client';
import { CurrentUser } from 'src/auth/current-user';
import { JwtAdminAuthGuard } from 'src/auth/guards/jwt.guard';
import { CreateMenuList } from './dto/menu/CreateMenuList.dto';
import { CreateRestaurantInput } from './dto/restaurant/CreateRestaurantInput';
import { CreateTableRequest } from './dto/qrcode/CreateTableRequest';
import { RestaurantService } from './restaurant.service';
import { UpdateMenuInput } from './dto/menu/UpdateMenu.dto';

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
      message: 'create restaurant success',
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

  @Get('/:restaurantId/menu')
  async getAllMenu(@Param('restaurantId') restaurantId: string) {
    const menu = await this.restaurantService.findAllMenuByRestaurantId(
      restaurantId,
    );
    return {
      data: { menu },
      message: `get all menu of restaurantId: ${restaurantId}`,
    };
  }

  @Get('/:restaurantId')
  async getRestaurant(@Param('restaurantId') restaurantId: string) {
    const restaurant = await this.restaurantService.findRestaurantById(
      restaurantId,
    );
    return {
      data: { restaurant },
      message: `get detail of restaurantId: ${restaurant.id}`,
    };
  }

  @Get('/menu/:menuId')
  async getMenuById(@Param('menuId') menuId: string) {
    const menu = await this.restaurantService.findMenuById(menuId);
    return {
      data: { menu },
      message: `get menu by menuId: ${menuId}`,
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

  @Put('/menu/:menuId')
  @UseGuards(JwtAdminAuthGuard)
  async updateMenu(
    @Body() updateDetail: UpdateMenuInput,
    @Param('menuId') menuId: string,
    @CurrentUser() admin: Admin,
  ) {
    // TODO imageUrl
    const imageUrl = 'mockUrl';
    const updatedMenu = await this.restaurantService.updateMenu(
      menuId,
      updateDetail,
      imageUrl,
      admin,
    );
    return {
      data: { menu: updatedMenu },
      message: 'update menu success',
    };
  }

  @Delete('/menu/:menuId')
  @UseGuards(JwtAdminAuthGuard)
  async deleteMenu(
    @Param('menuId') menuId: string,
    @CurrentUser() admin: Admin,
  ) {
    await this.restaurantService.deleteMenu(menuId, admin);
    return {
      message: `menu id: ${menuId} has been deleted`,
    };
  }
}
