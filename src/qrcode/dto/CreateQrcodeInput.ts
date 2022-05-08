import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateQrcodeInput {
  @IsNotEmpty()
  tableName: string;
  @IsOptional()
  restaurantId: string;
}
