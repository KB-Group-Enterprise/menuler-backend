import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { RestaurantService } from './restaurant.service';

@Module({
  imports: [PrismaModule],
  providers: [RestaurantService],
})
export class RestaurantModule {}
