import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AdminModule } from '../admin/admin.module';
import { AuthService } from './auth.service';
import { JwtAdminStrategy } from './strategies/jwt-admin.strategy';
import { AuthController } from './auth.controller';
import { JwtRestaurantStrategy } from './strategies/jwt-restaurant.strategy';
import { RestaurantModule } from 'src/restaurant/restaurant.module';

@Module({
  imports: [
    AdminModule,
    PassportModule,
    JwtModule.register({}),
    forwardRef(() => RestaurantModule),
  ],
  providers: [AuthService, JwtAdminStrategy, JwtRestaurantStrategy],
  controllers: [AuthController],
  exports: [JwtModule, AuthService],
})
export class AuthModule {}
