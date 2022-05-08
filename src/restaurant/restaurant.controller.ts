import { Body, Controller, Post } from '@nestjs/common';
import { CreateRestaurantInput } from './dto/CreateRestaurantInput';
import { CreateTableRequest } from './dto/CreateTableRequest';
import { RestaurantService } from './restaurant.service';

@Controller('restaurant')
export class RestaurantController {
  constructor(private restaurantService: RestaurantService) {}

  @Post('/')
  async createRestaurant(@Body() details: CreateRestaurantInput) {
    const restaurant = await this.restaurantService.createRestaurant(details);
    return restaurant;
  }

  @Post('/table')
  async createTable(@Body() { tables }: CreateTableRequest) {
    await this.restaurantService.insertTable(tables);
  }
}
