import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { LoginDto } from '../dto/login.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RefreshTokenGuard } from '../guards/refresh-token.guard';
import { CreateUserDto } from '@api/user/dto/create-user.dto';
import { User } from '../decorators/user.decorator';
import type { RequestUser } from '@api/user/core/request-user';
import { AuthCookieInterceptor } from '../interceptors/auth-cookie.interceptor';
import { ClearAuthCookieInterceptor } from '../interceptors/clear-auth-cookie.interceptor';

@Controller({ version: '1', path: 'auth' })
export class AuthV1Controller {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(AuthCookieInterceptor)
  async signup(@Body() body: CreateUserDto) {
    const tokens = await this.authService.signup(body);
    return { tokens, message: '회원가입이 완료되었습니다.' };
  }

  @Post('login')
  @UseInterceptors(AuthCookieInterceptor)
  async login(@Body() body: LoginDto) {
    const tokens = await this.authService.login(body);
    return { tokens, message: '로그인되었습니다.' };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @UseGuards(RefreshTokenGuard)
  @UseInterceptors(AuthCookieInterceptor)
  async refresh(@User() user: RequestUser) {
    const tokens = await this.authService.refresh(user.id);
    return { tokens, message: '토큰이 갱신되었습니다.' };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(ClearAuthCookieInterceptor)
  async logout(@User() user: RequestUser) {
    await this.authService.logout(user.id);
    return { message: '로그아웃되었습니다.' };
  }
}
