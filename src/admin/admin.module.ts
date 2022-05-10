import { Module } from '@nestjs/common';
import { QrcodeModule } from 'src/qrcode/qrcode.module';
import { RestaurantModule } from 'src/restaurant/restaurant.module';
import { RestaurantService } from 'src/restaurant/restaurant.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [PrismaModule, RestaurantModule, QrcodeModule],
  controllers: [AdminController],
  providers: [AdminService, RestaurantService],
  exports: [AdminService],
})
export class AdminModule {}
