import { Entity, PrimaryKey, Property, ManyToOne } from '@mikro-orm/core';
import { Option } from './option.entity';
import { OptionPriceCreationArgs } from './types/option-price-creation.args';

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

  static of(args: OptionPriceCreationArgs): OptionPrice {
    const optionPrice = new OptionPrice();
    optionPrice.price = args.price;
    optionPrice.option = args.option;
    optionPrice.validFrom = args.validFrom ?? new Date();
    optionPrice.validTo = args.validTo ?? null;
    return optionPrice;
  }
}
