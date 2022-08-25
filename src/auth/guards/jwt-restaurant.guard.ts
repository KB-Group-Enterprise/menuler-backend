import { AuthGuard } from '@nestjs/passport';

export class JwtRestaurantAuthGuard extends AuthGuard('jwt-restaurant') {}
