import { order_status } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsOptional } from 'class-validator';
import { BasePagination } from 'src/utils/dto/BasePagination.dto';

export class OrderFilter {
  @IsOptional()
  @IsEnum(order_status)
  status?: order_status;

  @Type(() => BasePagination)
  @IsOptional()
  pagination?: BasePagination;

  @IsOptional()
  isNeedBilling?: boolean;
}
