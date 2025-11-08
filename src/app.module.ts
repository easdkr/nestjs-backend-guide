import { Module, Logger } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { StoreModule } from './store/store.module';

@Module({
  imports: [
    MikroOrmModule.forRoot({
      autoLoadEntities: true,
      dbName: 'commerce',
      clientUrl: 'postgresql://postgres:postgres@localhost:15432/commerce',
      driver: PostgreSqlDriver,
      migrations: {
        path: './dist/migrations',
        pathTs: './src/migrations',
        glob: '!(*.d).{js,ts}',
        transactional: true,
        disableForeignKeys: false,
        allOrNothing: true,
        dropTables: true,
        safe: false,
        snapshot: true,
        emit: 'ts',
      },
      debug: true,
      logger: (msg) => new Logger('MikroORM').verbose(msg),
    }),
    StoreModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
