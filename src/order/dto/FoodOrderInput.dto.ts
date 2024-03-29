import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { food_order_status } from '../types/FoodOrder';
import { Options } from './Options.dto';
export class FoodOrderInput {
  @IsNotEmpty()
  @IsString()
  menuId: string;

  @IsNotEmpty()
  @IsString()
  foodName: string;

  // @IsNotEmpty()
  // @IsString()
  // category: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  note: string;

  // @IsOptional()
  // @IsString()
  // imageUrl?: string;

  // @IsNotEmpty()
  // @IsNumber()
  // priceEach: number;

  // @IsNotEmpty()
  // @IsEnum(menu_status)
  // menuStatus: menu_status;

  @IsNotEmpty()
  @IsArray()
  // @Type(() => Options)
  // @ValidateNested({ each: true })
  selectedOptions: string[];

  foodOrderId: string;
  userId: string;
  username: string;
  // status: food_order_status;
}
