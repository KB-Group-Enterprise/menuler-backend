import { Body, Controller, Post } from '@nestjs/common';
import { CreateRestaurantInput } from './dto/CreateRestaurantInput';
import { CreateTableRequest } from './dto/CreateTableRequest';
import { RestaurantService } from './restaurant.service';

@Controller('restaurant')
export class RestaurantController {
  constructor(private restaurantService: RestaurantService) {}
}
