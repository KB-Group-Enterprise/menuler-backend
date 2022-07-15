import { FoodOrderInput } from '../../order/dto/FoodOrderInput.dto';
import { BaseClient } from './BaseClient.dto';

export class SelectFood extends BaseClient {
  selectedFood: FoodOrderInput;
}
