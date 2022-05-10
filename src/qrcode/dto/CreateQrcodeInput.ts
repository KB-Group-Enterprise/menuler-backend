import { IsNotEmpty, IsOptional } from 'class-validator';
import { QrcodeSize } from 'src/restaurant/interfaces/qrcodeSize';

export class CreateQrcodeInput {
  @IsNotEmpty()
  tableName: string;
  @IsOptional()
  restaurantId: string;
  @IsNotEmpty()
  qrcodeSize: QrcodeSize;
}
