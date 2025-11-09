import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@api/user/entities/user.entity';
import { JwtPayload } from './jwt.strategy';
import { AuthTokenStorage } from './auth-token.storage';
import { TokenResponse } from '../types/token-response.type';
import { UserFinder } from '@api/user/components/user.finder';

@Injectable()
export class TokenGenerator {
  constructor(
    private readonly jwtService: JwtService,
    private readonly authTokenStorage: AuthTokenStorage,
    private readonly userFinder: UserFinder,
  ) {}

  async generate(user: User): Promise<TokenResponse> {
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

  async refresh(userId: number): Promise<TokenResponse> {
    const user = await this.userFinder.findById(userId);
    if (!user || !user.isActive()) {
      throw new UnauthorizedException('사용자를 찾을 수 없습니다.');
    }

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
