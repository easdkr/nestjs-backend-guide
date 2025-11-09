import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserCreationValidator } from '@api/user/components/user-creation.validator';
import { UserCreator } from '@api/user/components/user.creator';
import { UserFinder } from '@api/user/components/user.finder';
import { TokenGenerator } from '../components/token.generator';
import { AuthTokenStorage } from '../components/auth-token.storage';
import { CreateUserDto } from '@api/user/dto/create-user.dto';
import { LoginDto } from '../dto/login.dto';
import { User } from '@api/user/core/user.entity';
import { Gender } from '@api/user/core/gender.enum';
import { TokenResponse } from '../types/token-response.type';

describe('AuthService', () => {
  let service: AuthService;
  let userCreationValidator: jest.Mocked<UserCreationValidator>;
  let userCreator: jest.Mocked<UserCreator>;
  let userFinder: jest.Mocked<UserFinder>;
  let tokenGenerator: jest.Mocked<TokenGenerator>;
  let authTokenStorage: jest.Mocked<AuthTokenStorage>;

  beforeAll(async () => {
    const mockUserCreationValidator = {
      validate: jest.fn(),
    };

    const mockUserCreator = {
      create: jest.fn(),
    };

    const mockUserFinder = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
    };

    const mockTokenGenerator = {
      generate: jest.fn(),
      refresh: jest.fn(),
    };

    const mockAuthTokenStorage = {
      deleteAll: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserCreationValidator,
          useValue: mockUserCreationValidator,
        },
        {
          provide: UserCreator,
          useValue: mockUserCreator,
        },
        {
          provide: UserFinder,
          useValue: mockUserFinder,
        },
        {
          provide: TokenGenerator,
          useValue: mockTokenGenerator,
        },
        {
          provide: AuthTokenStorage,
          useValue: mockAuthTokenStorage,
        },
      ],
    }).compile();

    service = module.get(AuthService);
    userCreationValidator = module.get(UserCreationValidator);
    userCreator = module.get(UserCreator);
    userFinder = module.get(UserFinder);
    tokenGenerator = module.get(TokenGenerator);
    authTokenStorage = module.get(AuthTokenStorage);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('signup', () => {
    it('정상적인 회원가입', async () => {
      // Arrange
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'Test1234!',
        nickname: 'testuser',
        birthDate: '1990-01-01',
        gender: Gender.MALE,
        termsAgreed: true,
        marketingAgreed: false,
      };

      const user = new User();
      user.id = 1;
      user.email = createUserDto.email;
      user.nickname = createUserDto.nickname;

      const tokenResponse: TokenResponse = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };

      userCreationValidator.validate.mockResolvedValue(undefined);
      userCreator.create.mockResolvedValue(user);
      tokenGenerator.generate.mockResolvedValue(tokenResponse);

      // Act
      const result = await service.signup(createUserDto);

      // Assert
      expect(result).toBe(tokenResponse);
      expect(userCreationValidator.validate).toHaveBeenCalledWith({
        email: createUserDto.email,
      });
      expect(userCreator.create).toHaveBeenCalledWith(createUserDto);
      expect(tokenGenerator.generate).toHaveBeenCalledWith(user);
    });

    it('이미 존재하는 이메일인 경우 ConflictException 발생', async () => {
      // Arrange
      const createUserDto: CreateUserDto = {
        email: 'existing@example.com',
        password: 'Test1234!',
        nickname: 'testuser',
        birthDate: '1990-01-01',
        gender: Gender.MALE,
        termsAgreed: true,
      };

      userCreationValidator.validate.mockRejectedValue(
        new ConflictException('이미 존재하는 이메일입니다.'),
      );

      // Act & Assert
      await expect(service.signup(createUserDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.signup(createUserDto)).rejects.toThrow(
        '이미 존재하는 이메일입니다.',
      );
      expect(userCreationValidator.validate).toHaveBeenCalledWith({
        email: createUserDto.email,
      });
      expect(userCreator.create).not.toHaveBeenCalled();
      expect(tokenGenerator.generate).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('정상적인 로그인', async () => {
      // Arrange
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'Test1234!',
      };

      const user = new User();
      user.id = 1;
      user.email = loginDto.email;
      user.deletedAt = null;
      user.verifyPassword = jest.fn().mockReturnValue(true);

      const tokenResponse: TokenResponse = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };

      userFinder.findByEmail.mockResolvedValue(user);
      tokenGenerator.generate.mockResolvedValue(tokenResponse);

      // Act
      const result = await service.login(loginDto);

      // Assert
      expect(result).toBe(tokenResponse);
      expect(userFinder.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(user.verifyPassword).toHaveBeenCalledWith(loginDto.password);
      expect(tokenGenerator.generate).toHaveBeenCalledWith(user);
    });

    it('존재하지 않는 이메일인 경우 UnauthorizedException 발생', async () => {
      // Arrange
      const loginDto: LoginDto = {
        email: 'notfound@example.com',
        password: 'Test1234!',
      };

      userFinder.findByEmail.mockResolvedValue(null);

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(loginDto)).rejects.toThrow(
        '존재하지 않는 이메일입니다.',
      );
      expect(userFinder.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(tokenGenerator.generate).not.toHaveBeenCalled();
    });

    it('탈퇴한 사용자인 경우 UnauthorizedException 발생', async () => {
      // Arrange
      const loginDto: LoginDto = {
        email: 'deleted@example.com',
        password: 'Test1234!',
      };

      const user = new User();
      user.id = 1;
      user.email = loginDto.email;
      user.deletedAt = new Date();
      user.isActive = jest.fn().mockReturnValue(false);

      userFinder.findByEmail.mockResolvedValue(user);

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(loginDto)).rejects.toThrow(
        '이미 탈퇴한 사용자입니다.',
      );
      expect(userFinder.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(tokenGenerator.generate).not.toHaveBeenCalled();
    });

    it('잘못된 패스워드인 경우 UnauthorizedException 발생', async () => {
      // Arrange
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'WrongPassword',
      };

      const user = new User();
      user.id = 1;
      user.email = loginDto.email;
      user.deletedAt = null;
      user.verifyPassword = jest.fn().mockReturnValue(false);

      userFinder.findByEmail.mockResolvedValue(user);

      // Act & Assert
      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(loginDto)).rejects.toThrow(
        '이메일 또는 패스워드가 올바르지 않습니다.',
      );
      expect(userFinder.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(user.verifyPassword).toHaveBeenCalledWith(loginDto.password);
      expect(tokenGenerator.generate).not.toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('정상적인 로그아웃', async () => {
      // Arrange
      const userId = 1;
      authTokenStorage.deleteAll.mockResolvedValue(undefined);

      // Act
      await service.logout(userId);

      // Assert
      expect(authTokenStorage.deleteAll).toHaveBeenCalledWith(userId);
      expect(authTokenStorage.deleteAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('refresh', () => {
    it('정상적인 토큰 갱신', async () => {
      // Arrange
      const userId = 1;
      const user = new User();
      user.id = userId;
      user.email = 'test@example.com';
      user.deletedAt = null;

      const tokenResponse: TokenResponse = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      };

      userFinder.findById.mockResolvedValue(user);
      tokenGenerator.refresh.mockResolvedValue(tokenResponse);

      // Act
      const result = await service.refresh(userId);

      // Assert
      expect(result).toBe(tokenResponse);
      expect(userFinder.findById).toHaveBeenCalledWith(userId);
      expect(tokenGenerator.refresh).toHaveBeenCalledWith(user);
    });

    it('사용자를 찾을 수 없는 경우 UnauthorizedException 발생', async () => {
      // Arrange
      const userId = 999;
      userFinder.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.refresh(userId)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.refresh(userId)).rejects.toThrow(
        '사용자를 찾을 수 없습니다.',
      );
      expect(userFinder.findById).toHaveBeenCalledWith(userId);
      expect(tokenGenerator.refresh).not.toHaveBeenCalled();
    });

    it('비활성화된 사용자인 경우 UnauthorizedException 발생', async () => {
      // Arrange
      const userId = 1;
      const user = new User();
      user.id = userId;
      user.email = 'deleted@example.com';
      user.deletedAt = new Date();
      user.isActive = jest.fn().mockReturnValue(false);

      userFinder.findById.mockResolvedValue(user);

      // Act & Assert
      await expect(service.refresh(userId)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.refresh(userId)).rejects.toThrow(
        '사용자를 찾을 수 없습니다.',
      );
      expect(userFinder.findById).toHaveBeenCalledWith(userId);
      expect(tokenGenerator.refresh).not.toHaveBeenCalled();
    });
  });
});
