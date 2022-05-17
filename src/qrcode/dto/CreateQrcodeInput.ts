import { IsNotEmpty, IsOptional } from 'class-validator';
import { QrcodeSize } from '../../restaurant/dto/qrcode/QrcodeSize.dto';

export class CreateQrcodeInput {
  @IsNotEmpty()
  tableName: string;
  @IsOptional()
  restaurantId: string;
  @IsNotEmpty()
  qrcodeSize: QrcodeSize;
}
