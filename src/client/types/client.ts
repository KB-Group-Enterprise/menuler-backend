import { FoodOrderInput } from '../../order/dto/FoodOrderInput.dto';

export class Client {
  userId: string;
  username: string;
  selectedFoodList?: FoodOrderInput[];
}
