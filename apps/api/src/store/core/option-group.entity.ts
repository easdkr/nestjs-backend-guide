import {
  Entity,
  PrimaryKey,
  Property,
  ManyToOne,
  OneToMany,
  Collection,
  Cascade,
} from '@mikro-orm/core';
import { Product } from './product.entity';
import { Option } from './option.entity';
import { OptionGroupCreationArgs } from './types/option-group-creation.args';

@Entity()
export class OptionGroup {
  @PrimaryKey()
  id: number;

  @Property({ type: 'text' })
  name: string;

  @Property({ type: 'boolean', default: false })
  required: boolean = false;

  @ManyToOne(() => Product)
  product: Product;

  @OneToMany(() => Option, (option) => option.optionGroup, {
    cascade: [Cascade.PERSIST],
  })
  options = new Collection<Option>(this);

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  static of(args: OptionGroupCreationArgs): OptionGroup {
    const optionGroup = new OptionGroup();
    optionGroup.name = args.name;
    optionGroup.required = args.required;
    optionGroup.product = args.product;
    return optionGroup;
  }
}
