import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ResponseTransform } from './utils/interceptors/response-transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'debug'],
  });
  app.useGlobalInterceptors(new ResponseTransform());
  app.enableCors({
    allowedHeaders:"*",
    origin: "*"
  });
  app.useGlobalPipes(
    new ValidationPipe({
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
      skipMissingProperties: false,
      whitelist: true,
    }),
  );
  app.setGlobalPrefix('/api');
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
