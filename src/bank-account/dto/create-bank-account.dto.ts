import { IsNotEmpty, IsString } from 'class-validator';

export class CreateBankAccountDto {
  @IsNotEmpty()
  @IsString()
  bankName: string;

  @IsNotEmpty()
  @IsString()
  accountNumber: string;
}
