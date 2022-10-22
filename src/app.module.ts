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
import { ClientGroupModule } from './client-group/client-group.module';
import { ClientModule } from './client/client.module';
import { FileUploadModule } from './file-upload/file-upload.module';
import { FoodOrderModule } from './food-order/food-order.module';
import { OptionModule } from './option/option.module';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule.forRoot(),
    FileUploadModule.forRoot(),
    RestaurantModule,
    TableModule,
    AdminModule,
    AuthModule,
    MenuModule,
    OrderModule,
    ClientGroupModule,
    ClientModule,
    FoodOrderModule,
    OptionModule,
  ],
  controllers: [AppController, RestaurantController],
  providers: [
    AppService,
    PrismaService,
    RestaurantService,
    TableService,
    AdminService,
    OrderService,
  ],
})
export class AppModule {}
