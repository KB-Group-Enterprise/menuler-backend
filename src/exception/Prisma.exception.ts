import { HttpException } from '@nestjs/common';

export class PrismaException extends HttpException {
  constructor(error) {
    // Document Notfound
    if (error.code === 'P2025') super(error.meta.cause, 400);
    else super(error.message, 500);
  }
}
