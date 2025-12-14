import { Store } from '@api/store/core/store.entity';
import { Product } from '@api/store/core/product.entity';
import { OptionGroup } from '@api/store/core/option-group.entity';
import { Option } from '@api/store/core/option.entity';
import { OptionPrice } from '@api/store/core/option-price.entity';
import { Inventory } from '@api/store/core/inventory.entity';
import { InventoryTransaction } from '@api/store/core/inventory-transaction.entity';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { StoreFinder } from './components/store.finder';
import { ProductFinder } from './components/product.finder';
import { ProductCreationValidator } from './components/product-creation.validator';
import { ProductCreator } from './components/product.creator';
import { ProductService } from './services/product.service';
import { ProductV1Controller } from './controllers/product.v1.controller';

@Module({
  imports: [
    MikroOrmModule.forFeature([
      Store,
      Product,
      OptionGroup,
      Option,
      OptionPrice,
      Inventory,
      InventoryTransaction,
    ]),
  ],
  controllers: [ProductV1Controller],
  providers: [
    StoreFinder,
    ProductFinder,
    ProductCreationValidator,
    ProductCreator,
    ProductService,
  ],
  exports: [MikroOrmModule, StoreFinder, ProductFinder, ProductCreator],
})
export class StoreModule {}
