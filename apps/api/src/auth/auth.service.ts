import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { EntityManager } from '@mikro-orm/postgresql';
import { JwtService } from '@nestjs/jwt';
import { User } from './entities/user.entity';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { TokenService } from './token.service';
import { JwtPayload } from './jwt.strategy';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: EntityRepository<User>,
    private readonly em: EntityManager,
    private readonly jwtService: JwtService,
    private readonly tokenService: TokenService,
  ) {}

  async signup(signupDto: SignupDto): Promise<{ accessToken: string; refreshToken: string }> {
    const existingUser = await this.userRepository.findOne({
      email: signupDto.email,
    });

    if (existingUser) {
      throw new ConflictException('이미 존재하는 이메일입니다.');
    }

    const user = new User();
    user.email = signupDto.email;
    await user.changePassword(signupDto.password);
    user.nickname = signupDto.nickname;
    user.birthDate = new Date(signupDto.birthDate);
    user.gender = signupDto.gender;

    if (signupDto.termsAgreed) {
      user.termsAgreedAt = new Date();
    }

    if (signupDto.marketingAgreed) {
      user.marketingAgreedAt = new Date();
    }

    await this.em.persistAndFlush(user);

    return this.generateTokens(user);
  }

  async login(loginDto: LoginDto): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.userRepository.findOne({
      email: loginDto.email,
    });

    if (!user) {
      throw new UnauthorizedException('이메일 또는 패스워드가 올바르지 않습니다.');
    }

    if (!user.isActive()) {
      throw new UnauthorizedException('탈퇴한 회원입니다.');
    }

    const isPasswordValid = await user.verifyPassword(loginDto.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('이메일 또는 패스워드가 올바르지 않습니다.');
    }

    return this.generateTokens(user);
  }

  async logout(userId: number): Promise<void> {
    await this.tokenService.deleteAllTokens(userId);
  }

  private async generateTokens(user: User): Promise<{ accessToken: string; refreshToken: string }> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
    };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '1h' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    await this.tokenService.saveAccessToken(user.id, accessToken);
    await this.tokenService.saveRefreshToken(user.id, refreshToken);

    return {
      accessToken,
      refreshToken,
    };
  }
}

