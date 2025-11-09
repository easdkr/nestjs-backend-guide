import { Module, Provider, Type } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { User } from './core/user.entity';
import { UserCreationValidator } from '@api/user/components/user-creation.validator';
import { UserFinder } from '@api/user/components/user.finder';
import { UserCreator } from '@api/user/components/user.creator';
import { UserV1Controller } from './controllers/user.v1.controller';
import { UserService } from './services/user.service';
import { Controller } from '@nestjs/common/interfaces/controllers/controller.interface';

const components: Provider[] = [UserFinder, UserCreationValidator, UserCreator];
const services: Provider[] = [UserService];
const controllers: Type<Controller>[] = [UserV1Controller];

@Module({
  imports: [MikroOrmModule.forFeature([User])],
  controllers: [...controllers],
  providers: [...components, ...services],
  exports: [...components],
})
export class UserModule {}
