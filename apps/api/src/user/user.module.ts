import { Module, Provider } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { User } from './entities/user.entity';
import { UserCreationValidator } from '@api/user/components/user-creation.validator';
import { UserFinder } from '@api/user/components/user.finder';
import { UserCreator } from '@api/user/components/user.creator';

const components: Provider[] = [UserFinder, UserCreationValidator, UserCreator];

@Module({
  imports: [MikroOrmModule.forFeature([User])],
  providers: [...components],
  exports: [...components],
})
export class UserModule {}
