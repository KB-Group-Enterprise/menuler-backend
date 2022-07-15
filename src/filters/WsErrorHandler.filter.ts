import { ArgumentsHost, Catch, HttpException } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { EVENT_TYPE } from 'src/utils/enums/event-type.enum';

@Catch(WsException, HttpException)
export class WsErrorHandler {
  public catch(exception: HttpException, host: ArgumentsHost) {
    const client = host.switchToWs().getClient();
    this.handleError(client, exception);
  }

  public handleError(client: Socket, exception: HttpException | WsException) {
    console.log(exception);
    client.emit('error', {
      message: exception.message,
      type: EVENT_TYPE.ERROR,
    });
  }
}
