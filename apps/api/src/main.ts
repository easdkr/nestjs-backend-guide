import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  await app.listen(process.env.PORT ?? 3000);
}

bootstrap()
  .then(() => {
    const logger = new Logger('Bootstrap');
    logger.log('Server is running on port 3000');
  })
  .catch((error) => {
    const logger = new Logger('Bootstrap');
    logger.error(error);
  });
