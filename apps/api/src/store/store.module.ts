import { Store } from '@api/store/core/store.entity';
import { Product } from '@api/store/core/product.entity';
import { OptionGroup } from '@api/store/core/option-group.entity';
import { Option } from '@api/store/core/option.entity';
import { OptionPrice } from '@api/store/core/option-price.entity';
import { Inventory } from '@api/store/core/inventory.entity';
import { InventoryTransaction } from '@api/store/core/inventory-transaction.entity';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';

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
  providers: [],
  exports: [MikroOrmModule],
})
export class StoreModule {}
