import {
  ArgumentsHost,
  Catch,
  HttpException,
  Logger,
  WsExceptionFilter,
} from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { EVENT_TYPE } from 'src/utils/enums/event-type.enum';

@Catch(WsException, HttpException)
export class WsErrorHandler implements WsExceptionFilter {
  logger: Logger = new Logger('WebSocket');
  public catch(exception: HttpException, host: ArgumentsHost) {
    const client = host.switchToWs().getClient();
    this.handleError(client, exception);
  }

  public handleError(client: Socket, exception: HttpException | WsException) {
    this.logger.error(exception);
    // if (process.env.NODE_ENV !== 'production') {
    console.log(exception);
    // }
    if (exception instanceof HttpException) {
      client.emit('error', {
        ...(<HttpException>exception.getResponse()),
        // message: <HttpException>exception.getResponse(),
        // type: EVENT_TYPE.ERROR,
      });
    } else {
      client.emit('error', {
        message: exception.message,
        type: EVENT_TYPE.ERROR,
      });
    }
  }
}
