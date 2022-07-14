import { FoodOrderInput } from './FoodOrderInput.dto';

export class SelectFood {
  clientId: string;
  tableId: string;
  username: string;
  selectedFood: FoodOrderInput;
}
