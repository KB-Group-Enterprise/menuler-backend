import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { AdminService } from 'src/admin/admin.service';
import { AuthService } from '../auth.service';

@Injectable()
export class WsJwtGuard implements CanActivate {
  private logger: Logger = new Logger(WsJwtGuard.name);

  constructor(
    private authService: AuthService,
    private adminService: AdminService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client: Socket = context.switchToWs().getClient<Socket>();
    try {
      const authorization = client.handshake?.headers?.authorization as string;
      // console.log(client.handshake.headers)
      // console.log({ authorization })
      const token = authorization.split(' ')[1];
      const payload = this.authService.verifyAccessToken(token);
      const admin = await this.adminService.findAdminByAdminId(payload.sub);
      if (!admin) throw Error('invalid token');
      client.data.admin = admin;
      client.join(admin.restaurantId);

      return Boolean(admin);
    } catch (err) {
      client.emit('error', err);
      throw new WsException(err.message);
    }
  }
}
