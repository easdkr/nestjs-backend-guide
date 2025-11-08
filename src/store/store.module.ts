import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { Store } from './entities/store.entity';
import { Product } from './entities/product.entity';
import { OptionGroup } from './entities/option-group.entity';
import { Option } from './entities/option.entity';
import { OptionPrice } from './entities/option-price.entity';

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
  exports: [],
})
export class StoreModule {}
