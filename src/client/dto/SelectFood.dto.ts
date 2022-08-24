import { Type } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';
import { FoodOrderInput } from '../../order/dto/FoodOrderInput.dto';
import { BaseClient } from './BaseClient.dto';

export class SelectFood extends BaseClient {
  @IsNotEmpty()
  @Type(() => FoodOrderInput)
  selectedFood: FoodOrderInput;
}
