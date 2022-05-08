import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { RestaurantController } from './restaurant/restaurant.controller';
import { RestaurantService } from './restaurant/restaurant.service';
import { RestaurantModule } from './restaurant/restaurant.module';
import { PrismaModule } from './prisma/prisma.module';
import { QrcodeService } from './qrcode/qrcode.service';
import { QrcodeModule } from './qrcode/qrcode.module';

@Module({
  imports: [RestaurantModule, PrismaModule, QrcodeModule],
  controllers: [AppController, RestaurantController],
  providers: [AppService, PrismaService, RestaurantService, QrcodeService],
})
export class AppModule {}
