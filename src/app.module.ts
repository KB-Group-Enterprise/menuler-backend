import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { RestaurantController } from './restaurant/restaurant.controller';
import { RestaurantService } from './restaurant/restaurant.service';
import { RestaurantModule } from './restaurant/restaurant.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [RestaurantModule, PrismaModule],
  controllers: [AppController, RestaurantController],
  providers: [AppService, PrismaService, RestaurantService],
})
export class AppModule {}
