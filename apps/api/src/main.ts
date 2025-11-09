import { Logger } from '@nestjs/common';
import { createApp } from './app.factory';

async function bootstrap() {
  const app = await createApp();
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
