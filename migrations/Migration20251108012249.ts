import { Migration } from '@mikro-orm/migrations';

export class Migration20251108012249 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `create table "store" ("id" serial primary key, "name" text not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "deleted_at" time(0) null);`,
    );

    this.addSql(
      `create table "product" ("id" serial primary key, "name" text not null, "store_id" int not null, "created_at" timestamptz not null, "updated_at" timestamptz not null);`,
    );

    this.addSql(
      `create table "option_group" ("id" serial primary key, "name" text not null, "required" boolean not null default false, "product_id" int not null, "created_at" timestamptz not null, "updated_at" timestamptz not null);`,
    );

    this.addSql(
      `create table "option" ("id" serial primary key, "name" text not null, "option_group_id" int not null, "created_at" timestamptz not null, "updated_at" timestamptz not null);`,
    );

    this.addSql(
      `create table "option_price" ("id" serial primary key, "option_id" int not null, "price" int not null, "valid_from" timestamptz not null, "valid_to" varchar(255) null, "created_at" timestamptz not null, "updated_at" timestamptz not null);`,
    );

    this.addSql(
      `alter table "product" add constraint "product_store_id_foreign" foreign key ("store_id") references "store" ("id") on update cascade;`,
    );

    this.addSql(
      `alter table "option_group" add constraint "option_group_product_id_foreign" foreign key ("product_id") references "product" ("id") on update cascade;`,
    );

    this.addSql(
      `alter table "option" add constraint "option_option_group_id_foreign" foreign key ("option_group_id") references "option_group" ("id") on update cascade;`,
    );

    this.addSql(
      `alter table "option_price" add constraint "option_price_option_id_foreign" foreign key ("option_id") references "option" ("id") on update cascade;`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(
      `alter table "product" drop constraint "product_store_id_foreign";`,
    );

    this.addSql(
      `alter table "option_group" drop constraint "option_group_product_id_foreign";`,
    );

    this.addSql(
      `alter table "option" drop constraint "option_option_group_id_foreign";`,
    );

    this.addSql(
      `alter table "option_price" drop constraint "option_price_option_id_foreign";`,
    );

    this.addSql(`drop table if exists "store" cascade;`);

    this.addSql(`drop table if exists "product" cascade;`);

    this.addSql(`drop table if exists "option_group" cascade;`);

    this.addSql(`drop table if exists "option" cascade;`);

    this.addSql(`drop table if exists "option_price" cascade;`);
  }
}
