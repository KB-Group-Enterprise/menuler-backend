import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateBankAccountDto {
  @IsOptional()
  @IsString()
  bankName: string;

  @IsOptional()
  @IsString()
  accountNumber: string;

  @IsOptional()
  @IsString()
  accountName: string;
}
