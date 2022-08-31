import { IsNumber, IsOptional } from 'class-validator';

export class BasePagination {
  @IsOptional()
  @IsNumber()
  skip: number;

  @IsOptional()
  @IsNumber()
  limit: number;
}
