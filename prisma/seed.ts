import { PrismaClient } from '@prisma/client';
import { menu } from './mockData/menu';
import { permissions } from './mockData/permission';
import { restaurants } from './mockData/restaurant';
import { roles } from './mockData/role';
import { tables } from './mockData/table';

const prisma = new PrismaClient();

async function main() {
  console.log(`Start seeding ...`);
  for (const p of permissions) {
    const permission = await prisma.permission.create({ data: p });
    console.log(`Created permission with id : ${permission.id}`);
  }
  for (const ro of roles) {
    const role = await prisma.role.create({ data: ro });
    console.log(`Created role with id: ${role.id}`);
  }
  for (const r of restaurants) {
    const restaurant = await prisma.restaurant.create({ data: r });
    console.log(`Created restaurant with id: ${restaurant.id}`);
  }
  for (const m of menu) {
    const menu = await prisma.menu.create({ data: m });
    console.log(`Created menu with id: ${menu.id}`);
  }
  for (const t of tables) {
    const table = await prisma.table.create({ data: t });
    console.log(`Created menu with id: ${table.id}`);
  }
  console.log(`Seeding finished.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
