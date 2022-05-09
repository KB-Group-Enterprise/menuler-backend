import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { AdminService } from 'src/admin/admin.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt-admin') {
  constructor(
    private readonly adminService: AdminService,
    private readonly configService: ConfigService,
  ) {
    super({
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_ACCESS_SECRET'),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }
  async validate(payload: { sub: string; email: string }) {
    try {
      const admin = await this.adminService.findAdminByAdminId(payload.sub);
      return admin;
    } catch (error) {
      throw new UnauthorizedException(error);
    }
  }
}
