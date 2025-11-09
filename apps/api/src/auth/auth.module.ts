import { Module, Provider, Type } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthV1Controller } from './controllers/auth.v1.controller';
import { AuthService } from './services/auth.service';
import { AuthTokenStorage } from './components/auth-token.storage';
import { JwtStrategy } from './components/jwt.strategy';
import { TokenGenerator } from './components/token.generator';
import { UserModule } from '@api/user/user.module';
import { Controller } from '@nestjs/common/interfaces/controllers/controller.interface';

const controllers: Type<Controller>[] = [AuthV1Controller];
const components: Provider[] = [AuthTokenStorage, JwtStrategy, TokenGenerator];
const services: Provider[] = [AuthService];

@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secret',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [...controllers],
  providers: [...components, ...services],
  exports: [...components],
})
export class AuthModule {}
