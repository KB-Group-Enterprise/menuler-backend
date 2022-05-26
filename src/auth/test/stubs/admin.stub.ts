import { Admin } from '@prisma/client';

export const adminStub = (): Admin => ({
  email: 'testadmin@email.com',
  id: '02320i2089q319duj29iu',
  password: '12345678',
  restaurantId: '627100646e64e68312ef5833',
  updateRestaurantId: null,
});
