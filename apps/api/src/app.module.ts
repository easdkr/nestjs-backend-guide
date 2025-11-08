import { Module } from '@nestjs/common';
import { StoreModule } from '@api/store/store.module';
import { CommonModule } from '@libs/common/common.module';
import { AuthModule } from '@api/auth/auth.module';

@Module({
  imports: [CommonModule, StoreModule, AuthModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
