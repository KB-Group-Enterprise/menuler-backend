import { IsNotEmpty, IsString } from 'class-validator';

export class FoodOrderInput {
  @IsNotEmpty()
  @IsString()
  menuId: string;

  //   @IsNotEmpty()
  //   @IsString()
  //   foodName: string;

  //   @IsNotEmpty()
  //   @IsString()
  //   category: string;

  //   @IsOptional()
  //   @IsNotEmpty()
  //   @IsString()
  //   description: string;

  //   @IsNotEmpty()
  //   @IsString()
  //   imageUrl: string;

  //   @IsNotEmpty()
  //   @IsNumber()
  //   priceEach: number;

  //   @IsNotEmpty()
  //   @IsEnum(menu_status)
  //   isAvailable: menu_status;
}
