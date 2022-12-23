import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { FoodOrderInput } from './FoodOrderInput.dto';

export class ClientCreateOrderDto {
  // @IsNotEmpty()
  // @IsArray()
  // @Type(() => FoodOrderInput)
  // @ValidateNested({ each: true })
  foodOrderList: FoodOrderInput[];

  // @IsNotEmpty()
  // @IsString()
  restaurantId: string;

  // @IsNotEmpty()
  // @IsString()
  tableToken: string;

  // @IsNotEmpty()
  // @IsString()
  clientGroupId: string;
}
