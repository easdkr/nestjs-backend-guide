import { Module } from '@nestjs/common';
import { CommonModule } from '@libs/common';
import { StoreModule } from '@api/store/store.module';

@Module({
  imports: [CommonModule, StoreModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
