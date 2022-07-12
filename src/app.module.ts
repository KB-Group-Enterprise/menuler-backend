import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { RestaurantController } from './restaurant/restaurant.controller';
import { RestaurantService } from './restaurant/restaurant.service';
import { RestaurantModule } from './restaurant/restaurant.module';
import { PrismaModule } from './prisma/prisma.module';
import { TableService } from './table/table.service';
import { TableModule } from './table/table.module';
import { AdminService } from './admin/admin.service';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { MenuModule } from './menu/menu.module';
import { OrderModule } from './order/order.module';
import { OrderService } from './order/order.service';
import { TableGateWay } from './table/table.gateway';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    RestaurantModule,
    PrismaModule,
    TableModule,
    AdminModule,
    AuthModule,
    MenuModule,
    OrderModule,
  ],
  controllers: [AppController, RestaurantController],
  providers: [
    AppService,
    PrismaService,
    RestaurantService,
    TableService,
    AdminService,
    OrderService,
    TableGateWay,
  ],
})
export class AppModule {}
