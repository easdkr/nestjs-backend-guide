import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@api/auth/guards/jwt-auth.guard';
import { UserResponseDto } from '../dto/user-response.dto';
import { UserService } from '@api/user/services/user.service';
import { User } from '@api/auth/decorators/user.decorator';
import type { RequestUser } from '@api/user/types/request-user.type';

@Controller({ version: '1', path: 'users' })
export class UserV1Controller {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@User() user: RequestUser): Promise<UserResponseDto> {
    return await this.userService.findOne(user.id).then(UserResponseDto.from);
  }
}
