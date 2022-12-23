import { forwardRef, Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
import { AdminModule } from '../admin/admin.module';
import { PrismaModule } from '../prisma/prisma.module';
import { TableModule } from '../table/table.module';
import { RestaurantService } from './restaurant.service';

@Module({
  imports: [
    PrismaModule,
    TableModule,
    AdminModule,
    forwardRef(() => AuthModule),
  ],
  providers: [RestaurantService],
  exports: [RestaurantService],
})
export class RestaurantModule {}
