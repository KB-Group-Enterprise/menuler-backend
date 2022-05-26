import { Restaurant } from '@prisma/client';

export const restaurantStub = (): Restaurant => ({
  id: '627100646e64e68312ef5833',
  isActivate: true,
  location: 'https://google.map',
  registerOn: new Date('2022-05-06T10:02:52.680Z'),
  restaurantName: 'mockRestaurant',
  status: 'OPEN',
  updatedAt: new Date(),
});
