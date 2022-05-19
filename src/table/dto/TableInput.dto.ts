import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { QrcodeSize } from './QrcodeSize.dto';

export class TableInput {
  @IsNotEmpty()
  @IsString()
  tableName: string;

  @IsNotEmpty()
  @Type(() => QrcodeSize)
  @ValidateNested({ each: true })
  qrcodeSize: QrcodeSize;
}
