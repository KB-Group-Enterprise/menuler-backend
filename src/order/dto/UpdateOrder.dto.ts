import {
  order_client_state,
  order_overall_food_status,
  order_status,
} from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { FoodOrderInput } from './FoodOrderInput.dto';

export class UpdateOrderDto {
  @IsOptional()
  @IsArray()
  @Type(() => FoodOrderInput)
  @ValidateNested({ each: true })
  addtionalFoodOrderList: FoodOrderInput[];

  @IsEnum(order_status)
  @IsOptional()
  status: order_status;

  @IsEnum(order_client_state)
  @IsOptional()
  clientState: order_client_state;

  @IsEnum(order_overall_food_status)
  @IsOptional()
  overallFoodStatus: order_overall_food_status;

  @IsOptional()
  @IsString()
  tableId: string;
}
