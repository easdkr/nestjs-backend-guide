import { CreateProductDto } from '@api/store/dto/create-product.dto';
import { Product } from '@api/store/core/product.entity';
import { OptionGroup } from '@api/store/core/option-group.entity';
import { Option } from '@api/store/core/option.entity';
import { OptionPrice } from '@api/store/core/option-price.entity';
import { Store } from '@api/store/core/store.entity';
import { EntityRepository, Transactional } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ProductCreator {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: EntityRepository<Product>,
  ) {}

  @Transactional()
  async create(dto: CreateProductDto, store: Store): Promise<Product> {
    const product = Product.of({
      name: dto.name,
      store,
    });

    const optionGroups = dto.optionGroups.map((optionGroupDto) => {
      const optionGroup = OptionGroup.of({
        name: optionGroupDto.name,
        required: optionGroupDto.required,
        product,
      });

      const options = optionGroupDto.options.map((optionDto) => {
        const option = Option.of({
          name: optionDto.name,
          optionGroup,
        });

        const prices = optionDto.prices.map((priceDto) =>
          OptionPrice.of({
            price: priceDto.price,
            option,
            validFrom: priceDto.validFrom
              ? new Date(priceDto.validFrom)
              : undefined,
            validTo: priceDto.validTo ? new Date(priceDto.validTo) : null,
          }),
        );
        option.prices.set(prices);

        return option;
      });

      optionGroup.options.set(options);

      return optionGroup;
    });

    product.optionGroups.set(optionGroups);

    this.productRepository.getEntityManager().persist(product);

    return product;
  }
}
