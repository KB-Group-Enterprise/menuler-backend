import { food_order_status } from '@prisma/client';
import { IsEnum, IsMongoId, IsNotEmpty } from 'class-validator';

export class UpdateFoodOrderDto {
  @IsNotEmpty()
  @IsMongoId()
  foodOrderId: string;

  @IsNotEmpty()
  @IsEnum(food_order_status)
  status: food_order_status;
}
