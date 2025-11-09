import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { Request } from 'express';
import { AuthTokenStorage } from './auth-token.storage';
import { RequestUser } from '@api/user/types/request-user.type';

export interface JwtPayload {
  sub: number;
  email: string;
}

const extractTokenFromCookieOrHeader = (req: Request): string | null => {
  // 1. 쿠키에서 먼저 확인
  if (req.cookies?.accessToken) {
    return req.cookies.accessToken;
  }

  // 2. Authorization 헤더에서 확인 (하위 호환성)
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.replace('Bearer ', '');
  }

  return null;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authTokenStorage: AuthTokenStorage) {
    super({
      jwtFromRequest: extractTokenFromCookieOrHeader,
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'secret',
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: JwtPayload): Promise<RequestUser> {
    const userId = payload.sub;
    const token = extractTokenFromCookieOrHeader(req);
    const storedToken = await this.authTokenStorage.getAccessToken(userId);

    if (!storedToken || !token || storedToken !== token) {
      throw new UnauthorizedException('토큰이 만료되었거나 유효하지 않습니다.');
    }

    return {
      id: payload.sub,
      email: payload.email,
    };
  }
}
