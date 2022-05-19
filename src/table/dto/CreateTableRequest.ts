import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, ValidateNested } from 'class-validator';
import { TableInput } from './TableInput.dto';

export class CreateTableRequest {
  @IsNotEmpty()
  @IsArray()
  @Type(() => TableInput)
  @ValidateNested({ each: true })
  tables: TableInput[];
}
