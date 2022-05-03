import { Body, Controller, Post } from '@nestjs/common';
import { CreateRestaurantInput } from './dto/CreateRestaurantInput';
import { RestaurantService } from './restaurant.service';

@Controller('restaurant')
export class RestaurantController {
  constructor(private restaurantService: RestaurantService) {}

  @Post('/')
  async createRestaurant(@Body() details: CreateRestaurantInput) {
    const restaurant = await this.restaurantService.createRestaurant(details);
    return restaurant;
  }
}
