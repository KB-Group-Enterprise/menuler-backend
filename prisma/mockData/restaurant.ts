import { Prisma } from '@prisma/client';
import { roles } from './role';

export const restaurants: Prisma.RestaurantCreateInput[] = [
  {
    id: '630f32beb001d2c4bebfd7bd',
    location: 'http://google.map',
    restaurantName: 'restaurant1',
    admin: {
      create: {
        email: 'admin_restaurant1@email.com',
        firstname: 'admin1',
        lastname: 'restaurant1',
        password: '12345678',
        roleId: roles[0].id,
      },
    },
  },
];
