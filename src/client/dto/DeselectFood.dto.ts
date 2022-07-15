import { IsNotEmpty } from 'class-validator';
import { BaseClient } from './BaseClient.dto';

export class DeselectFood extends BaseClient {
  @IsNotEmpty()
  foodOrderId: string;
}
