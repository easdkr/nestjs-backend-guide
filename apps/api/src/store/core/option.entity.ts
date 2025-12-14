import {
  Entity,
  PrimaryKey,
  Property,
  ManyToOne,
  OneToMany,
  Collection,
  Cascade,
} from '@mikro-orm/core';
import { OptionGroup } from './option-group.entity';
import { OptionPrice } from './option-price.entity';
import { OptionCreationArgs } from './types/option-creation.args';

@Entity()
export class Option {
  @PrimaryKey()
  id: number;

  @Property({ type: 'text' })
  name: string;

  @ManyToOne(() => OptionGroup)
  optionGroup: OptionGroup;

  @OneToMany(() => OptionPrice, (optionPrice) => optionPrice.option, {
    cascade: [Cascade.PERSIST],
  })
  prices = new Collection<OptionPrice>(this);

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  static of(args: OptionCreationArgs): Option {
    const option = new Option();
    option.name = args.name;
    option.optionGroup = args.optionGroup;
    return option;
  }
}
