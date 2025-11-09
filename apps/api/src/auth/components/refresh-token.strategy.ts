import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import type { Request } from 'express';
import { AuthTokenStorage } from './auth-token.storage';
import { JwtPayload } from './jwt.strategy';
import { RequestUser } from '@api/user/types/request-user.type';

const extractRefreshTokenFromCookie = (req: Request): string | null => {
  if (req.cookies?.refreshToken) {
    return req.cookies.refreshToken as string;
  }

  return null;
};

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'refresh-token',
) {
  constructor(private readonly authTokenStorage: AuthTokenStorage) {
    super({
      jwtFromRequest: extractRefreshTokenFromCookie,
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'secret',
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: JwtPayload): Promise<RequestUser> {
    const userId = payload.sub;
    const token = extractRefreshTokenFromCookie(req);
    const storedToken = await this.authTokenStorage.getRefreshToken(userId);

    if (!storedToken || !token || storedToken !== token) {
      throw new UnauthorizedException(
        '리프레시 토큰이 만료되었거나 유효하지 않습니다.',
      );
    }

    return {
      id: payload.sub,
      email: payload.email,
    };
  }
}
