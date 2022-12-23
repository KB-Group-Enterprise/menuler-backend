import { bill_status } from '@prisma/client';
import { IsEnum, IsMongoId, IsNotEmpty, IsOptional } from 'class-validator';

export class AdminUpdateBillDto {
  @IsNotEmpty()
  @IsMongoId()
  billId: string;

  @IsOptional()
  @IsEnum(bill_status)
  status: bill_status;
}
