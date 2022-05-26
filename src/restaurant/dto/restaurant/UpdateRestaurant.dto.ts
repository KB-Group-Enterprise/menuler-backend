import { restaurant_status } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';

export class UpdateRestaurantDto {
  @IsOptional()
  restaurantName: string;

  @IsOptional()
  location: string;

  @IsOptional()
  @IsEnum(restaurant_status)
  status: restaurant_status;
}
