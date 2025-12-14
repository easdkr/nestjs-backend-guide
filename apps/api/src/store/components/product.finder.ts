import { Product } from '@api/store/core/product.entity';
import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class ProductFinder {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: EntityRepository<Product>,
  ) {}

  async findById(id: number): Promise<Product | null> {
    return await this.productRepository.findOne({ id });
  }

  async getById(id: number): Promise<Product> {
    const product = await this.findById(id);
    if (!product) {
      throw new NotFoundException(`상품을 찾을 수 없습니다: ${id}`);
    }
    return product;
  }

  async findByStoreIdAndName(
    storeId: number,
    name: string,
  ): Promise<Product | null> {
    return await this.productRepository.findOne({
      store: { id: storeId },
      name,
    });
  }
}
