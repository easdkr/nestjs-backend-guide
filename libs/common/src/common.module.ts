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
  ],
  exports: [],
})
export class CommonModule {}
