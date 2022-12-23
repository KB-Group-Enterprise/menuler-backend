import {
  order_client_state,
  order_overall_food_status,
  order_status,
} from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { UpdateFoodOrderDto } from 'src/food-order/dto/update-food-order.dto';
import { AdminUpdateBillDto } from './AdminUpdateBill.dto';

export class AdminUpdateOrderDto {
  @IsNotEmpty()
  @IsMongoId()
  orderId: string;

  @IsOptional()
  @IsNotEmpty()
  @IsEnum(order_client_state)
  clientState?: order_client_state;

  @IsOptional()
  @IsNotEmpty()
  @IsEnum(order_overall_food_status)
  overallFoodStatus?: order_overall_food_status;

  @IsOptional()
  @IsNotEmpty()
  @IsEnum(order_status)
  status?: order_status;

  @IsOptional()
  @IsArray()
  deleteFoodOrderList?: string[];

  @IsOptional()
  @IsArray()
  @Type(() => UpdateFoodOrderDto)
  @ValidateNested({ each: true })
  updateFoodOrderList?: UpdateFoodOrderDto[];

  @IsOptional()
  @IsString()
  // @IsMongoId()
  transferTableId?: string;

  @IsOptional()
  @IsObject()
  bill?: AdminUpdateBillDto;

  @IsOptional()
  @IsArray()
  deleteClientList?: string[];
}
