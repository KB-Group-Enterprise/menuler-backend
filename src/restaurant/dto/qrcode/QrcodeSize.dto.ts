import { IsNotEmpty } from 'class-validator';

export class QrcodeSize {
  @IsNotEmpty()
  width: number;
  @IsNotEmpty()
  height: number;
}
