import { Module } from '@nestjs/common';
import { StoreModule } from '@api/store/store.module';
import { CommonModule } from '@libs/common/common.module';
import { AuthModule } from '@api/auth/auth.module';
import { UserModule } from '@api/user/user.module';

@Module({
  imports: [CommonModule, StoreModule, UserModule, AuthModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
