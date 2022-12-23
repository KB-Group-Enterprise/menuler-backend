import { menu_status } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
export class CreateMenuDto {
  @IsNotEmpty()
  @IsString()
  foodName: string;

  @IsNotEmpty()
  @IsString()
  category: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  price: string;

  @IsOptional()
  @IsEnum(menu_status)
  menuStatus?: menu_status;
}
