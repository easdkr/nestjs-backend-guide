/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { AuthTokenStorage } from './auth-token.storage';

export interface JwtPayload {
  sub: number;
  email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authTokenStorage: AuthTokenStorage) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'secret',
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: JwtPayload) {
    const userId = payload.sub;
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '');
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
