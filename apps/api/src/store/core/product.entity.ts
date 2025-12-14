import {
  Entity,
  PrimaryKey,
  Property,
  ManyToOne,
  OneToMany,
  Collection,
  Cascade,
} from '@mikro-orm/core';
import { Store } from './store.entity';
import { OptionGroup } from './option-group.entity';
import { ProductCreationArgs } from './types/product-creation.args';

@Entity()
export class Product {
  @PrimaryKey()
  id: number;

  @Property({ type: 'text' })
  name: string;

  @ManyToOne(() => Store)
  store: Store;

  @OneToMany(() => OptionGroup, (optionGroup) => optionGroup.product, {
    cascade: [Cascade.PERSIST],
  })
  optionGroups = new Collection<OptionGroup>(this);

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  static of(args: ProductCreationArgs): Product {
    const product = new Product();
    product.name = args.name;
    product.store = args.store;
    return product;
  }
}
