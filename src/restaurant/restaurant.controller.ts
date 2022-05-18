import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { Admin } from '@prisma/client';
import { CurrentUser } from 'src/auth/current-user';
import { JwtAdminAuthGuard } from 'src/auth/guards/jwt.guard';
import { CreateRestaurantInput } from './dto/restaurant/CreateRestaurantInput';
import { CreateTableRequest } from './dto/qrcode/CreateTableRequest';
import { RestaurantService } from './restaurant.service';
import { UpdateMenuInput } from 'src/menu/dto/UpdateMenu.dto';
import { UpdateRestaurantDto } from './dto/restaurant/UpdateRestaurant.dto';

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

  @Get('/get/all')
  async getAllRestaurant() {
    const allRestaurant = await this.restaurantService.findAllRestaurant();
    return {
      data: {
        restaurantList: allRestaurant,
      },
      message: 'get all restaurant',
    };
  }

  @Put('/')
  @UseGuards(JwtAdminAuthGuard)
  async updateRestaurant(
    @Body() updateDetail: UpdateRestaurantDto,
    @CurrentUser() admin: Admin,
  ) {
    const updatedRestaurant = await this.restaurantService.updateRestaurantInfo(
      admin,
      updateDetail,
    );
    return {
      data: {
        restaurant: updatedRestaurant,
      },
      message: `update restaurant id: ${admin.restaurantId} success`,
    };
  }
}
