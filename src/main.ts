import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaExceptionFilter } from './utils/exception/prisma.exception';
import { ResponseTransform } from './utils/interceptors/response-transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'debug'],
  });
  app.enableCors({
    origin: '*',
    credentials: true,
    methods: 'GET,PUT,POST,DELETE',
  });
  app.useGlobalInterceptors(new ResponseTransform());
  app.useGlobalFilters(new PrismaExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
      skipMissingProperties: false,
      // whitelist: true,
    }),
  );
  app.setGlobalPrefix('/api');
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
