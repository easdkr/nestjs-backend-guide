import { Store } from '@api/store/core/store.entity';
import { Product } from '@api/store/core/product.entity';
import { OptionGroup } from '@api/store/core/option-group.entity';
import { Option } from '@api/store/core/option.entity';
import { OptionPrice } from '@api/store/core/option-price.entity';
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
    ]),
  ],
  providers: [],
  exports: [MikroOrmModule],
})
export class StoreModule {}
