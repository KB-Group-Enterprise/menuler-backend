import { Type } from 'class-transformer';
import { IsNotEmpty, ValidateNested } from 'class-validator';
import { QrcodeSize } from './QrcodeSize.dto';

export class TableInput {
  @IsNotEmpty()
  tableName: string;

  @IsNotEmpty()
  @Type(() => QrcodeSize)
  @ValidateNested({ each: true })
  qrcodeSize: QrcodeSize;
}
