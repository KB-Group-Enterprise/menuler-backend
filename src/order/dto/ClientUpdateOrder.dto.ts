import { Type } from 'class-transformer';
import {
  IsArray,
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
  @Type(() => FoodOrderInput)
  @ValidateNested({ each: true })
  additionalFoodOrderList: FoodOrderInput[];

  @IsOptional()
  @IsString()
  tableToken?: string;

  @IsNotEmpty()
  clientGroupId: string;
}
