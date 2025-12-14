import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import type { Response } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface LogoutResponse {
  message: string;
}

@Injectable()
export class ClearAuthCookieInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data: LogoutResponse) => {
        const res = context.switchToHttp().getResponse<Response>();
        this.clearAuthCookies(res);
        return data;
      }),
    );
  }

  private clearAuthCookies(res: Response): void {
    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
    };

    res.clearCookie('accessToken', options);
    res.clearCookie('refreshToken', options);
  }
}
