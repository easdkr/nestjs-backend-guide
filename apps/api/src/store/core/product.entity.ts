import {
  Entity,
  PrimaryKey,
  Property,
  ManyToOne,
  OneToMany,
  Collection,
} from '@mikro-orm/core';
import { Store } from './store.entity';
import { OptionGroup } from './option-group.entity';

@Entity()
export class Product {
  @PrimaryKey()
  id: number;

  @Property({ type: 'text' })
  name: string;

  @ManyToOne(() => Store)
  store: Store;

  @OneToMany(() => OptionGroup, (optionGroup) => optionGroup.product)
  optionGroups = new Collection<OptionGroup>(this);

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
