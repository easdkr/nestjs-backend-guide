import { CreateProductDto } from '@api/store/dto/create-product.dto';
import { Product } from '@api/store/core/product.entity';
import { Injectable } from '@nestjs/common';
import { StoreFinder } from '../components/store.finder';
import { ProductCreationValidator } from '../components/product-creation.validator';
import { ProductCreator } from '../components/product.creator';

@Injectable()
export class ProductService {
  constructor(
    private readonly storeFinder: StoreFinder,
    private readonly productCreationValidator: ProductCreationValidator,
    private readonly productCreator: ProductCreator,
  ) {}

  async create(dto: CreateProductDto): Promise<Product> {
    const store = await this.storeFinder.getById(dto.storeId);

    await this.productCreationValidator.validate({
      storeId: dto.storeId,
      name: dto.name,
    });

    return await this.productCreator.create(dto, store);
  }
}
