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
import { CreateRestaurantInput } from './dto/restaurant/CreateRestaurantInput';
import { RestaurantService } from './restaurant.service';
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
      admin,
      restaurantDetails,
    );
    return {
      data: { restaurant },
      message: 'create restaurant success',
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

  @Delete('/:restaurantId')
  @UseGuards(JwtAdminAuthGuard)
  async deleteRestaurant(
    @Param('restaurantId') restaurantId: string,
    @CurrentUser() admin: Admin,
  ) {
    await this.restaurantService.deleteRestaurantById(restaurantId, admin);
    return {
      message: `delete restaurant id: ${restaurantId} success`,
    };
  }
}
