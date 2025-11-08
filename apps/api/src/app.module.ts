import { Module } from '@nestjs/common';
import { StoreModule } from '@api/store/store.module';
import { CommonModule } from '@libs/common/common.module';

@Module({
  imports: [CommonModule, StoreModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
