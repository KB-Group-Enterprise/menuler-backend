import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { QrcodeModule } from 'src/qrcode/qrcode.module';
import { RestaurantService } from './restaurant.service';

@Module({
  imports: [PrismaModule, QrcodeModule],
  providers: [RestaurantService],
})
export class RestaurantModule {}
