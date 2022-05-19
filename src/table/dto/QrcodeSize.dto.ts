import { IsNotEmpty, IsNumber } from 'class-validator';

export class QrcodeSize {
  @IsNotEmpty()
  @IsNumber()
  width: number;
  @IsNotEmpty()
  @IsNumber()
  height: number;
}
