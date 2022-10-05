import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Admin } from '@prisma/client';
import { Socket } from 'socket.io';

export const CurrentWsAdmin = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): Admin => {
    const client = ctx.switchToWs().getClient() as Socket;
    return client.data.admin;
  },
);
