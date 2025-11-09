import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { LoginDto } from '../dto/login.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CreateUserDto } from '@api/user/dto/create-user.dto';
import { User } from '../decorators/user.decorator';
import type { RequestUser } from '../../user/types/request-user.type';

@Controller({ version: '1', path: 'auth' })
export class AuthV1Controller {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async signup(@Body() body: CreateUserDto) {
    return this.authService.signup(body);
  }

  @Post('login')
  async login(@Body() body: LoginDto) {
    return this.authService.login(body);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async logout(@User() user: RequestUser) {
    await this.authService.logout(user.id);
    return { message: '로그아웃되었습니다.' };
  }
}
