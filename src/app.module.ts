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
import { AdminService } from './admin/admin.service';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { MenuModule } from './menu/menu.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    RestaurantModule,
    PrismaModule,
    QrcodeModule,
    AdminModule,
    AuthModule,
    MenuModule,
  ],
  controllers: [AppController, RestaurantController],
  providers: [
    AppService,
    PrismaService,
    RestaurantService,
    QrcodeService,
    AdminService,
  ],
})
export class AppModule {}
