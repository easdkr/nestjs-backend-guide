import { Entity, PrimaryKey, Property, ManyToOne } from '@mikro-orm/core';
import { Option } from './option.entity';

@Entity()
export class OptionPrice {
  @PrimaryKey()
  id: number;

  @ManyToOne(() => Option)
  option: Option;

  @Property({ type: 'integer' })
  price: number;

  @Property()
  validFrom: Date = new Date();

  @Property({ nullable: true })
  validTo: Date | null = null;

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}

