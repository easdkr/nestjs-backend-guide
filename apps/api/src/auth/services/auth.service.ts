import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from '../dto/login.dto';
import { TokenGenerator } from '../components/token.generator';
import { AuthTokenStorage } from '../components/auth-token.storage';
import { UserCreator } from '@api/user/components/user.creator';
import { UserCreationValidator } from '@api/user/components/user-creation.validator';
import { CreateUserDto } from '@api/user/dto/create-user.dto';
import { UserFinder } from '@api/user/components/user.finder';
import { TokenResponse } from '../types/token-response.type';

@Injectable()
export class AuthService {
  constructor(
    private readonly userCreationValidator: UserCreationValidator,
    private readonly userCreator: UserCreator,
    private readonly userFinder: UserFinder,
    private readonly tokenGenerator: TokenGenerator,
    private readonly authTokenStorage: AuthTokenStorage,
  ) {}

  async signup(dto: CreateUserDto): Promise<TokenResponse> {
    await this.userCreationValidator.validate({ email: dto.email });

    const user = await this.userCreator.create(dto);

    return this.tokenGenerator.generate(user);
  }

  async login(dto: LoginDto): Promise<TokenResponse> {
    const user = await this.userFinder.findByEmail(dto.email);

    if (!user) {
      throw new UnauthorizedException('존재하지 않는 이메일입니다.');
    }

    if (!user.isActive()) {
      throw new UnauthorizedException('이미 탈퇴한 사용자입니다.');
    }

    if (!user.verifyPassword(dto.password)) {
      throw new UnauthorizedException(
        '이메일 또는 패스워드가 올바르지 않습니다.',
      );
    }

    return this.tokenGenerator.generate(user);
  }

  async logout(userId: number): Promise<void> {
    await this.authTokenStorage.deleteAllTokens(userId);
  }

  async refresh(userId: number): Promise<TokenResponse> {
    return await this.tokenGenerator.refresh(userId);
  }
}
