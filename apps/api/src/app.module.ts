import { Module, Type } from '@nestjs/common';
import { StoreModule } from '@api/store/store.module';
import { CommonModule } from '@libs/common/common.module';
import { AuthModule } from '@api/auth/auth.module';
import { UserModule } from '@api/user/user.module';

export const appModules: Type[] = [StoreModule, UserModule, AuthModule];

@Module({
  imports: [CommonModule, ...appModules],
  controllers: [],
  providers: [],
})
export class AppModule {}
