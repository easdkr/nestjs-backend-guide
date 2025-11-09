import {
  Entity,
  PrimaryKey,
  Property,
  ManyToOne,
  OneToMany,
  Collection,
} from '@mikro-orm/core';
import { OptionGroup } from './option-group.entity';
import { OptionPrice } from './option-price.entity';

@Entity()
export class Option {
  @PrimaryKey()
  id: number;

  @Property({ type: 'text' })
  name: string;

  @ManyToOne(() => OptionGroup)
  optionGroup: OptionGroup;

  @OneToMany(() => OptionPrice, (optionPrice) => optionPrice.option)
  prices = new Collection<OptionPrice>(this);

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
