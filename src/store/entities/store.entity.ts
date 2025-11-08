import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class Store {
  @PrimaryKey()
  id: number;

  @Property({ type: 'text' })
  name: string;

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  @Property({ nullable: true, type: 'time with time zone' })
  deletedAt: Date | null = null;
}
