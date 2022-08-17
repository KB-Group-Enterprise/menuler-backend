import { menu_status } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Options } from './Options.dto';
export class FoodOrderInput {
  @IsNotEmpty()
  @IsString()
  menuId: string;

  @IsNotEmpty()
  @IsString()
  foodName: string;

  @IsNotEmpty()
  @IsString()
  category: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  imageUrl: string;

  @IsNotEmpty()
  @IsNumber()
  priceEach: number;

  @IsNotEmpty()
  @IsEnum(menu_status)
  isAvailable: menu_status;

  @IsArray()
  @Type(() => Options)
  @ValidateNested({ each: true })
  selectedOptions: Options[];

  foodOrderId: string;
  userId: string;
}
