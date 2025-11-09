import { Module, OnModuleInit } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { Migrator } from '@mikro-orm/migrations';
import { ValkeyModule } from '@libs/common/valkey/valkey.module';
import { appModules } from '@api/app.module';
import { TestContainerConfig } from './test-containers.helper';
import { MikroORM } from '@mikro-orm/core';

export function createTestAppModule(config: TestContainerConfig) {
  @Module({
    imports: [
      MikroOrmModule.forRoot({
        autoLoadEntities: true,
        dbName: 'commerce',
        clientUrl: config.postgresUrl,
        driver: PostgreSqlDriver,
        debug: false,
        logger: () => {}, // 로그 비활성화
        extensions: [Migrator],
        migrations: {
          pathTs: './migrations',
          glob: '!(*.d).{js,ts}',
          transactional: true,
          disableForeignKeys: false,
          allOrNothing: true,
          dropTables: true,
          safe: false,
        },
        ensureDatabase: true,
      }),
      ValkeyModule.forRoot({
        host: config.valkeyHost,
        port: config.valkeyPort,
        connectTimeout: 10000,
        commandTimeout: 10000,
        retryStrategy: (times) => times * 100,
        maxRetriesPerRequest: 10,
      }),
      ...appModules,
    ],
  })
  class TestAppModule implements OnModuleInit {
    constructor(public readonly orm: MikroORM) {}

    async onModuleInit() {
      const migrator = this.orm.getMigrator();
      await migrator.up();
    }
  }

  return TestAppModule;
}
