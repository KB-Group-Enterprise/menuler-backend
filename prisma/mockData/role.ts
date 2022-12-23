import { Prisma } from '@prisma/client';
import { permissions } from './permission';

export const roles: Prisma.RoleCreateInput[] = [
  {
    id: '630f32c41a4a9911578f99f6',
    key: 'ROOT',
    name: 'root',
    permissionId: [...permissions.map((p) => p.id)],
  },
  {
    id: '630f32c82da24a866f3b8e47',
    key: 'STAFF',
    name: 'staff',
    permissionId: [...permissions.map((p) => p.id)],
  },
];
