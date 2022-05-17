import { Module } from '@nestjs/common';
import { AdminModule } from '../admin/admin.module';
import { PrismaModule } from '../prisma/prisma.module';
import { QrcodeModule } from '../qrcode/qrcode.module';
import { RestaurantService } from './restaurant.service';

@Module({
  imports: [PrismaModule, QrcodeModule, AdminModule],
  providers: [RestaurantService],
})
export class RestaurantModule {}
