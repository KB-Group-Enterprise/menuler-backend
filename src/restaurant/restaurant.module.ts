import { Module } from '@nestjs/common';
import { AdminModule } from '../admin/admin.module';
import { PrismaModule } from '../prisma/prisma.module';
import { TableModule } from '../table/table.module';
import { RestaurantService } from './restaurant.service';

@Module({
  imports: [PrismaModule, TableModule, AdminModule],
  providers: [RestaurantService],
})
export class RestaurantModule {}
