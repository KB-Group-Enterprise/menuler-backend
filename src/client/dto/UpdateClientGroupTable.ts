import {
  client_group_status,
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

export class UpdateClientGroupTable {
  @IsNotEmpty()
  clientGroupId: string;

  @IsOptional()
  @IsEnum(client_group_status)
  status: client_group_status;
}
