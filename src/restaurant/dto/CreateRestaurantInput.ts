import { IsNotEmpty, IsOptional } from 'class-validator';
import { restaurant_status } from '@prisma/client';
export class CreateRestaurantInput {
  @IsNotEmpty()
  restaurantName: string;

  @IsNotEmpty()
  location: string;

  @IsOptional()
  status: restaurant_status;
}
