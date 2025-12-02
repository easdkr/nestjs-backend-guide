import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import type { Request } from 'express';
import { AuthTokenStorage } from './auth-token.storage';
import { RequestUser } from '@api/user/core/request-user';
import type { Role } from '@api/user/core/role.enum';

export interface JwtPayload {
  sub: number;
  email: string;
  role: Role;
}

const extractTokenFromCookieOrHeader = (req: Request): string | null => {
  // 1. 쿠키에서 먼저 확인
  if (req.cookies?.accessToken) {
    return req.cookies.accessToken as string;
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
      role: payload.role,
    };
  }
}
