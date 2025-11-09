import {
  Entity,
  PrimaryKey,
  Property,
  ManyToOne,
  OneToMany,
  Collection,
} from '@mikro-orm/core';
import { Product } from './product.entity';
import { Option } from './option.entity';

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

  @OneToMany(() => Option, (option) => option.optionGroup)
  options = new Collection<Option>(this);

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
