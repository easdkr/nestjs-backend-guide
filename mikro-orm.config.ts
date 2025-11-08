import { defineConfig } from '@mikro-orm/postgresql';
import { Migrator } from '@mikro-orm/migrations';

export default defineConfig({
  entities: ['./dist/**/*.entity.js'],
  entitiesTs: ['./apps/api/src/**/*.entity.ts', './libs/**/*.entity.ts'],
  dbName: 'commerce',
  clientUrl: 'postgresql://postgres:postgres@localhost:15432/commerce',
  extensions: [Migrator],
  migrations: {
    pathTs: './migrations',
    glob: '!(*.d).{js,ts}',
    transactional: true,
    disableForeignKeys: false,
    allOrNothing: true,
    dropTables: true,
    safe: false,
    snapshot: true,
    emit: 'ts',
  },
});
