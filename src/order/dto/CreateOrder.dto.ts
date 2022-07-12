import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { FoodOrderInput } from './FoodOrderInput.dto';

export class CreateOrderDto {
  @IsNotEmpty()
  @IsArray()
  @Type(() => FoodOrderInput)
  @ValidateNested({ each: true })
  foodOrderList: FoodOrderInput[];

  @IsNotEmpty()
  @IsString()
  restaurantId: string;

  @IsNotEmpty()
  @IsString()
  tableId: string;

  @IsNotEmpty()
  @IsString()
  clientGroupId: string;
}
