import { Migration } from '@mikro-orm/migrations';

export class Migration20251004033610 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `create table "store" (
        "id" serial primary key,
        "name" text not null,
        "created_at" timestamptz not null,
        "updated_at" timestamptz not null,
        "deleted_at" time(0) null
      );`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "store" cascade;`);
  }
}
