import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateTableInput {
  @IsNotEmpty()
  @IsOptional()
  @IsString()
  tableName?: string;

  @IsNotEmpty()
  @IsOptional()
  @IsBoolean()
  isRenewQrcode?: boolean;

  @IsOptional()
  @IsBoolean()
  isActivate?: boolean;
}
