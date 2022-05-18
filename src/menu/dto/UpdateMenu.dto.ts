import { menu_status } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';

export class UpdateMenuInput {
  @IsOptional()
  foodName?: string;
  @IsOptional()
  category?: string;
  @IsOptional()
  description?: string;
  @IsOptional()
  price?: number;
  @IsOptional()
  @IsEnum(menu_status)
  isAvailable: menu_status;
}
