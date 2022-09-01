import { Prisma } from '@prisma/client';
import { restaurants } from './restaurant';
import { roles } from './role';

export const admins: Prisma.AdminCreateInput[] = [
  {
    email: 'tempadmin1@email.com',
    firstname: 'temp',
    lastname: 'admin1',
    password: '123456789',
    restaurant: { connect: { id: restaurants[0].id } },
    role: { connect: { id: roles[1].id } },
  },
];
