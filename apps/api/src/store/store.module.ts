import { Store } from '@api/store/entities/store.entity';
import { Product } from '@api/store/entities/product.entity';
import { OptionGroup } from '@api/store/entities/option-group.entity';
import { Option } from '@api/store/entities/option.entity';
import { OptionPrice } from '@api/store/entities/option-price.entity';
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
