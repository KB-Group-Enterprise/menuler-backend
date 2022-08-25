import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { RestaurantService } from 'src/restaurant/restaurant.service';

@Injectable()
export class JwtRestaurantStrategy extends PassportStrategy(
  Strategy,
  'jwt-restaurant',
) {
  constructor(
    private readonly restaurantService: RestaurantService,
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
      const restaurant = await this.restaurantService.findRestaurantById(
        payload.sub,
      );
      return restaurant;
    } catch (error) {
      console.log(error);
      throw new UnauthorizedException(error);
    }
  }
}
