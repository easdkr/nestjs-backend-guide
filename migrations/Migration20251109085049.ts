import { Migration } from '@mikro-orm/migrations';

export class Migration20251109085049 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `create table "user" (
        "id" serial primary key,
        "email" text not null,
        "password" text not null,
        "nickname" text not null,
        "birth_date" date not null,
        "gender" text not null,
        "terms_agreed_at" timestamptz null,
        "marketing_agreed_at" timestamptz null,
        "created_at" timestamptz not null,
        "updated_at" timestamptz not null,
        "deleted_at" timestamptz null
      );`,
    );

    this.addSql(
      `alter table "user" add constraint "user_email_unique" unique ("email");`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "user" cascade;`);
  }
}
