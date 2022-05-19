import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateTableInput {
  @IsNotEmpty()
  @IsOptional()
  @IsString()
  tableName: string;

  @IsOptional()
  @IsBoolean()
  isActivate: boolean;
}
