import { Prisma } from '@prisma/client';

export const permissions: Prisma.PermissionCreateInput[] = [
  {
    id: '630f3299f5a9809025c56bce',
    key: 'READ',
    name: 'read',
    description: 'read',
  },
  {
    id: '630f32a1a84ef3786145ad28',
    key: 'WRITE',
    name: 'write',
    description: 'write',
  },
];
