import { Product } from '@api/store/core/product.entity';
import { OptionGroup } from '@api/store/core/option-group.entity';
import { Option } from '@api/store/core/option.entity';
import { OptionPrice } from '@api/store/core/option-price.entity';

export class OptionPriceResponseDto {
  id: number;
  price: number;
  validFrom: Date;
  validTo: Date | null;

  static from(optionPrice: OptionPrice): OptionPriceResponseDto {
    return {
      id: optionPrice.id,
      price: optionPrice.price,
      validFrom: optionPrice.validFrom,
      validTo: optionPrice.validTo,
    };
  }
}

export class OptionResponseDto {
  id: number;
  name: string;
  prices: OptionPriceResponseDto[];

  static from(option: Option): OptionResponseDto {
    return {
      id: option.id,
      name: option.name,
      prices: option.prices.getItems().map(OptionPriceResponseDto.from),
    };
  }
}

export class OptionGroupResponseDto {
  id: number;
  name: string;
  required: boolean;
  options: OptionResponseDto[];

  static from(optionGroup: OptionGroup): OptionGroupResponseDto {
    return {
      id: optionGroup.id,
      name: optionGroup.name,
      required: optionGroup.required,
      options: optionGroup.options.getItems().map(OptionResponseDto.from),
    };
  }
}

export class ProductResponseDto {
  id: number;
  name: string;
  storeId: number;
  optionGroups: OptionGroupResponseDto[];
  createdAt: Date;
  updatedAt: Date;

  static from(product: Product): ProductResponseDto {
    return {
      id: product.id,
      name: product.name,
      storeId: product.store.id,
      optionGroups: product.optionGroups
        .getItems()
        .map(OptionGroupResponseDto.from),
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }
}
