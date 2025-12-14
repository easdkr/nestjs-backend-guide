import { AuthToken } from '@api/auth/core/auth-token';
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import type { Response } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface AuthResponse {
  tokens: AuthToken;
  message: string;
}

@Injectable()
export class AuthCookieInterceptor implements NestInterceptor {
  private readonly ACCESS_TOKEN_MAX_AGE = 60 * 60 * 1000; // 1시간
  private readonly REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7일

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data: AuthResponse) => {
        if (data?.tokens) {
          const res = context.switchToHttp().getResponse<Response>();
          this.setAuthCookies(res, data.tokens);
          return { message: data.message };
        }
        return data;
      }),
    );
  }

  private setAuthCookies(res: Response, tokens: AuthToken): void {
    const baseOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
    };

    res.cookie('accessToken', tokens.accessToken, {
      ...baseOptions,
      maxAge: this.ACCESS_TOKEN_MAX_AGE,
    });

    res.cookie('refreshToken', tokens.refreshToken, {
      ...baseOptions,
      maxAge: this.REFRESH_TOKEN_MAX_AGE,
    });
  }
}
