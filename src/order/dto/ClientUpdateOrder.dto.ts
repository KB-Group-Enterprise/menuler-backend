import { bill_method, client_status, order_client_state } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { FoodOrderInput } from './FoodOrderInput.dto';

export class ClientUpdateOrderDto {
  @IsNotEmpty()
  @IsString()
  orderId: string;

  @IsOptional()
  @IsArray()
  // @Type(() => FoodOrderInput)
  // @ValidateNested({ each: true })
  additionalFoodOrderList?: FoodOrderInput[];

  @IsOptional()
  @IsString()
  tableToken?: string;

  @IsOptional()
  @IsEnum(order_client_state)
  clientState?: order_client_state;

  @IsOptional()
  @IsEnum(bill_method)
  billMethod?: bill_method;

  @IsNotEmpty()
  clientGroupId: string;
}
