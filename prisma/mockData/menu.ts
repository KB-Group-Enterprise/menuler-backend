import { Prisma } from '@prisma/client';
import { restaurants } from './restaurant';

export const menu: Prisma.MenuCreateInput[] = [
  {
    id: '630f32af4bbb3a0f0efc13da',
    foodName: 'test',
    category: 'steak',
    price: 120,
    imageUrl: 'https://img.kapook.com/u/2017/sarinee/July/week3/cok2.jpg',
    restaurant: {
      connect: { id: restaurants[0].id },
    },
  },
  {
    id: '630f32b6eb82929aceb9920c',
    foodName: 'test12e2',
    category: 'noodle',
    price: 200,
    imageUrl: 'https://www.saphanmai.com/wp-content/uploads/2020/09/2.jpg',
    restaurant: {
      connect: { id: restaurants[0].id },
    },
  },
];
