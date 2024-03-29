import { Menu } from '@prisma/client';
export enum food_order_status {
  SERVED = 'SERVED',
  CANCEL = 'CANCEL',
  COOKING = 'COOKING',
  PENDING = 'PENDING',
  ORDERED = 'ORDERED',
}
export type FoodOrder = Menu & {
  status: food_order_status;
  userId: string;
  username: string;
};
