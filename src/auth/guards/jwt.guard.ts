import { AuthGuard } from '@nestjs/passport';

export class JwtAdminAuthGuard extends AuthGuard('jwt-admin') {}
