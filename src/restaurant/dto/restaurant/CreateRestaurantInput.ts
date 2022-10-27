import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { restaurant_status } from '@prisma/client';
export class CreateRestaurantInput {
  @IsNotEmpty()
  @IsString()
  restaurantName: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsString()
  location: string;

  @IsOptional()
  @IsEnum(restaurant_status)
  status: restaurant_status;

  @IsNotEmpty()
  @IsString()
  firstname: string;

  @IsNotEmpty()
  @IsString()
  lastname: string;

  accountNumber: string;
  bankName: string;
}
