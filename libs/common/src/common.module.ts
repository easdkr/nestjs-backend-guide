import { ValkeyModule } from './valkey/valkey.module';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { Module, Logger } from '@nestjs/common';

@Module({
  imports: [
    MikroOrmModule.forRoot({
      autoLoadEntities: true,
      dbName: 'commerce',
      clientUrl: 'postgresql://postgres:postgres@localhost:15432/commerce',
      driver: PostgreSqlDriver,
      debug: true,
      logger: (msg) => new Logger('MikroORM').verbose(msg),
    }),
    ValkeyModule.forRoot({
      host: 'localhost',
      port: 16379,
      connectTimeout: 10000,
      commandTimeout: 10000,
      retryStrategy: (times) => times * 100,
      maxRetriesPerRequest: 10,
    }),
  ],
  exports: [],
})
export class CommonModule {}
