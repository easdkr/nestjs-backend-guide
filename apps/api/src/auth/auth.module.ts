import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './services/auth.service';
import { AuthTokenStorage } from './components/auth-token.storage';
import { JwtStrategy } from './components/jwt.strategy';
import { TokenGenerator } from './components/token.generator';
import { UserModule } from '@api/user/user.module';

@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secret',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthTokenStorage, JwtStrategy, TokenGenerator],
  exports: [AuthService],
})
export class AuthModule {}
