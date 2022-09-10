import { Type } from 'class-transformer';
import { IsNotEmpty, ValidateNested } from 'class-validator';
import { FoodOrderInput } from '../../order/dto/FoodOrderInput.dto';
import { BaseClient } from './BaseClient.dto';

export class SelectFood extends BaseClient {
  @IsNotEmpty()
  // @Type(() => FoodOrderInput)
  // @ValidateNested({ each: true })
  selectedFood: FoodOrderInput[];
}
