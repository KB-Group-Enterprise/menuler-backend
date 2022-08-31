import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AdminModule } from '../admin/admin.module';
import { AuthService } from './auth.service';
import { JwtAdminStrategy } from './strategies/jwt-admin.strategy';
import { AuthController } from './auth.controller';

@Module({
  imports: [AdminModule, PassportModule, JwtModule.register({})],
  providers: [AuthService, JwtAdminStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
