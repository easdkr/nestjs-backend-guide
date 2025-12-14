import { Injectable, ConflictException } from '@nestjs/common';
import { ProductFinder } from './product.finder';

@Injectable()
export class ProductCreationValidator {
  constructor(private readonly productFinder: ProductFinder) {}

  async validate(args: { storeId: number; name: string }): Promise<void> {
    const existingProduct = await this.productFinder.findByStoreIdAndName(
      args.storeId,
      args.name,
    );

    if (existingProduct) {
      throw new ConflictException(
        '해당 스토어에 동일한 이름의 상품이 이미 존재합니다.',
      );
    }
  }
}
