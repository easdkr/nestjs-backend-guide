import { Migration } from '@mikro-orm/migrations';

export class Migration20251202151938 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `create table "inventory" ("id" serial primary key, "product_id" int not null, "option_id" int null, "quantity" int not null default 0, "reserved_quantity" int not null default 0, "created_at" timestamptz not null, "updated_at" timestamptz not null);`,
    );
    this.addSql(
      `alter table "inventory" add constraint "inventory_product_id_option_id_unique" unique ("product_id", "option_id");`,
    );

    this.addSql(
      `create table "inventory_transaction" ("id" serial primary key, "inventory_id" int not null, "type" text check ("type" in ('INBOUND', 'OUTBOUND', 'ADJUSTMENT')) not null, "reason" text check ("reason" in ('WMS_INBOUND', 'RETURN_RECEIVED', 'EXCHANGE_RETURN', 'WRONG_SHIPMENT_RETURN', 'ORDER_SHIPMENT', 'EXCHANGE_SHIPMENT', 'WRONG_SHIPMENT_RESHIPPING', 'DAMAGE', 'LOST', 'EXPIRED', 'INVENTORY_COUNT_PLUS', 'INVENTORY_COUNT_MINUS', 'MANUAL_ADJUSTMENT')) not null, "quantity" int not null, "previous_quantity" int not null, "current_quantity" int not null, "reference_type" text check ("reference_type" in ('ORDER', 'WMS_RECEIPT', 'RETURN', 'EXCHANGE', 'INVENTORY_COUNT', 'ADMIN')) null, "reference_id" varchar(100) null, "note" text null, "processed_by" varchar(100) null, "created_at" timestamptz not null);`,
    );
    this.addSql(
      `create index "inventory_transaction_reference_id_index" on "inventory_transaction" ("reference_id");`,
    );
    this.addSql(
      `create index "inventory_transaction_reference_type_reference_id_index" on "inventory_transaction" ("reference_type", "reference_id");`,
    );
    this.addSql(
      `create index "inventory_transaction_inventory_id_created_at_index" on "inventory_transaction" ("inventory_id", "created_at");`,
    );

    this.addSql(
      `alter table "inventory" add constraint "inventory_product_id_foreign" foreign key ("product_id") references "product" ("id") on update cascade;`,
    );
    this.addSql(
      `alter table "inventory" add constraint "inventory_option_id_foreign" foreign key ("option_id") references "option" ("id") on update cascade on delete set null;`,
    );

    this.addSql(
      `alter table "inventory_transaction" add constraint "inventory_transaction_inventory_id_foreign" foreign key ("inventory_id") references "inventory" ("id") on update cascade;`,
    );

    this.addSql(
      `alter table "user" add column "role" text not null default 'USER';`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(
      `alter table "inventory_transaction" drop constraint "inventory_transaction_inventory_id_foreign";`,
    );

    this.addSql(`drop table if exists "inventory" cascade;`);

    this.addSql(`drop table if exists "inventory_transaction" cascade;`);

    this.addSql(`alter table "user" drop column "role";`);
  }
}
