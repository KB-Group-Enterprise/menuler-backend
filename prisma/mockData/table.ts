import { Prisma } from '@prisma/client';
import { restaurants } from './restaurant';

export const tables: Prisma.TableCreateInput[] = [
  {
    id: '630f32d015614480619c7c43',
    tableToken: '3f861ea3-54d2-48da-a0d9-c8a9686f05d6',
    qrcodeImageUrl: `http://api.qrserver.com/v1/create-qr-code/?data=${process.env.FRONTEND_URL}/customer/menu/abkdowakos20dwmo1!&size=100x100`,
    restaurant: {
      connect: { id: restaurants[0].id },
    },
    tableName: 'A01',
  },
];
