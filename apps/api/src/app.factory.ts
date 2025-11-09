import { NestFactory } from '@nestjs/core';
import {
  INestApplication,
  ValidationPipe,
  Type,
  LogLevel,
} from '@nestjs/common';
import { AppModule } from './app.module';

export async function createApp(
  module?: Type,
  options?: { logger?: LogLevel[] | false },
): Promise<INestApplication> {
  const appOptions =
    options?.logger !== undefined ? { logger: options.logger } : undefined;
  const app = await NestFactory.create(module ?? AppModule, appOptions);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  return app;
}
