import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@api/user/core/user.entity';
import { JwtPayload } from './jwt.strategy';
import { AuthTokenStorage } from './auth-token.storage';
import { AuthToken } from '../core/auth-token';

@Injectable()
export class TokenGenerator {
  constructor(
    private readonly jwtService: JwtService,
    private readonly authTokenStorage: AuthTokenStorage,
  ) {}

  async generate(user: User): Promise<AuthToken> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
    };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '1h' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    await this.authTokenStorage.saveAccessToken(user.id, accessToken);
    await this.authTokenStorage.saveRefreshToken(user.id, refreshToken);

    return {
      accessToken,
      refreshToken,
    };
  }

  async refresh(user: User): Promise<AuthToken> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
    };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '1h' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    await this.authTokenStorage.saveAccessToken(user.id, accessToken);
    await this.authTokenStorage.saveRefreshToken(user.id, refreshToken);

    return {
      accessToken,
      refreshToken,
    };
  }
}
