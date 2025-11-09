/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import {
  startTestContainers,
  stopTestContainers,
} from '../helpers/test-containers.helper';
import { createTestAppModule } from '../helpers/test-app.module';
import { createApp } from '@api/app.factory';
import { Gender } from '@api/user/entities/user.entity';
import { CreateUserDto } from '@api/user/dto/create-user.dto';
import { LoginDto } from '@api/auth/dto/login.dto';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const config = await startTestContainers();
    const TestAppModule = createTestAppModule(config);
    app = await createApp(TestAppModule, { logger: false });
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await stopTestContainers();
  });

  describe('POST /v1/auth/signup', () => {
    const baseSignupDto: CreateUserDto = {
      email: 'test@example.com',
      password: 'Test1234!',
      nickname: 'testuser',
      birthDate: '1990-01-01',
      gender: Gender.MALE,
      termsAgreed: true,
      marketingAgreed: false,
    };

    it('정상적인 회원가입 요청', async () => {
      // Arrange
      const dto = {
        ...baseSignupDto,
        email: 'test@example.com',
      };

      // Act
      const response = await request(app.getHttpServer())
        .post('/v1/auth/signup')
        .send(dto)
        .expect(201);

      // Assert
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
    });

    it('중복 이메일 가입 시도', async () => {
      // Arrange
      const dto = {
        ...baseSignupDto,
        email: 'test2@example.com',
      };

      // Act
      await request(app.getHttpServer())
        .post('/v1/auth/signup')
        .send(dto)
        .expect(201);

      // Act
      const response = await request(app.getHttpServer())
        .post('/v1/auth/signup')
        .send(dto)
        .expect(HttpStatus.CONFLICT);

      // Assert
      expect(response.body.message).toContain('이미 존재하는 이메일');
    });

    it('유효하지 않은 이메일 형식', async () => {
      // Arrange
      const invalidDto = {
        ...baseSignupDto,
        email: 'invalid-email',
      };

      // Act
      const response = await request(app.getHttpServer())
        .post('/v1/auth/signup')
        .send(invalidDto)
        .expect(HttpStatus.BAD_REQUEST);

      // Assert
      expect(response.body.message).toContain('올바른 이메일 형식이 아닙니다.');
    });

    it('패스워드가 최소 길이 미만', async () => {
      // Arrange
      const invalidDto = {
        ...baseSignupDto,
        email: 'test2@example.com',
        password: 'Test1!',
      };

      // Act
      const response = await request(app.getHttpServer())
        .post('/v1/auth/signup')
        .send(invalidDto)
        .expect(HttpStatus.BAD_REQUEST);

      // Assert
      expect(response.body.message).toContain(
        '패스워드는 최소 8자 이상이어야 합니다.',
      );
    });

    it('패스워드에 대문자, 소문자, 숫자, 특수문자가 모두 포함되지 않음', async () => {
      // Arrange
      const invalidDto = {
        ...baseSignupDto,
        email: 'test3@example.com',
        password: 'test1234',
      };

      // Act
      const response = await request(app.getHttpServer())
        .post('/v1/auth/signup')
        .send(invalidDto)
        .expect(HttpStatus.BAD_REQUEST);

      // Assert
      expect(response.body.message).toContain(
        '패스워드는 대문자, 소문자, 숫자, 특수문자를 각각 하나 이상 포함해야 합니다.',
      );
    });

    it('닉네임이 최소 길이 미만', async () => {
      // Arrange
      const invalidDto = {
        ...baseSignupDto,
        email: 'test4@example.com',
        nickname: 'a',
      };

      // Act
      const response = await request(app.getHttpServer())
        .post('/v1/auth/signup')
        .send(invalidDto)
        .expect(HttpStatus.BAD_REQUEST);

      // Assert
      expect(response.body.message).toContain(
        '닉네임은 최소 2자 이상이어야 합니다.',
      );
    });

    it('이용약관 동의 여부가 없음', async () => {
      // Arrange
      const invalidDto = {
        ...baseSignupDto,
        email: 'test5@example.com',
        termsAgreed: undefined,
      };

      // Act
      const response = await request(app.getHttpServer())
        .post('/v1/auth/signup')
        .send(invalidDto)
        .expect(HttpStatus.BAD_REQUEST);

      // Assert
      expect(response.body.message).toContain(
        '이용약관 동의 여부는 필수입니다.',
      );
    });
  });

  describe('POST /auth/login', () => {
    const signupDto: CreateUserDto = {
      email: 'login@example.com',
      password: 'Login1234!',
      nickname: 'loginuser',
      birthDate: '1990-01-01',
      gender: Gender.MALE,
      termsAgreed: true,
      marketingAgreed: false,
    };

    beforeAll(async () => {
      await request(app.getHttpServer())
        .post('/v1/auth/signup')
        .send(signupDto)
        .expect(201);
    });

    it('정상적인 로그인 요청', async () => {
      // Arrange
      const loginDto: LoginDto = {
        email: signupDto.email,
        password: signupDto.password,
      };

      // Act
      const response = await request(app.getHttpServer())
        .post('/v1/auth/login')
        .send(loginDto)
        .expect(HttpStatus.CREATED);

      // Assert
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
    });

    it('존재하지 않는 이메일로 로그인 시도', async () => {
      // Arrange
      const loginDto: LoginDto = {
        email: 'nonexistent@example.com',
        password: 'Password123!',
      };

      // Act
      const response = await request(app.getHttpServer())
        .post('/v1/auth/login')
        .send(loginDto)
        .expect(HttpStatus.UNAUTHORIZED);

      // Assert
      expect(response.body.message).toBe('존재하지 않는 이메일입니다.');
    });

    it('잘못된 패스워드로 로그인 시도', async () => {
      // Arrange
      const loginDto: LoginDto = {
        email: signupDto.email,
        password: 'WrongPassword123!',
      };

      // Act
      const response = await request(app.getHttpServer())
        .post('/v1/auth/login')
        .send(loginDto)
        .expect(HttpStatus.UNAUTHORIZED);

      // Assert
      expect(response.body.message).toContain(
        '이메일 또는 패스워드가 올바르지 않습니다.',
      );
    });

    it('유효하지 않은 이메일 형식', async () => {
      // Arrange
      const loginDto: LoginDto = {
        email: 'invalid-email',
        password: 'Password123!',
      };

      // Act
      const response = await request(app.getHttpServer())
        .post('/v1/auth/login')
        .send(loginDto)
        .expect(HttpStatus.BAD_REQUEST);

      // Assert
      expect(response.body.message).toContain('올바른 이메일 형식이 아닙니다.');
    });

    it('패스워드가 없음', async () => {
      // Arrange
      const loginDto = {
        email: signupDto.email,
      };

      // Act
      const response = await request(app.getHttpServer())
        .post('/v1/auth/login')
        .send(loginDto)
        .expect(HttpStatus.BAD_REQUEST);

      // Assert
      expect(response.body.message).toContain('패스워드는 필수입니다.');
    });
  });

  describe('POST /v1/auth/logout', () => {
    const signupDto: CreateUserDto = {
      email: 'logout@example.com',
      password: 'Logout1234!',
      nickname: 'logoutuser',
      birthDate: '1990-01-01',
      gender: Gender.MALE,
      termsAgreed: true,
      marketingAgreed: false,
    };

    let accessToken: string;

    beforeAll(async () => {
      const signupResponse = await request(app.getHttpServer())
        .post('/v1/auth/signup')
        .send(signupDto)
        .expect(201);

      accessToken = signupResponse.body.accessToken;
    });

    it('정상적인 로그아웃 요청', async () => {
      // Arrange
      const response = await request(app.getHttpServer())
        .post('/v1/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(HttpStatus.OK);

      // Assert
      expect(response.body.message).toBe('로그아웃되었습니다.');
    });

    it('인증 토큰 없이 로그아웃 시도', async () => {
      // Arrange
      const response = await request(app.getHttpServer())
        .post('/v1/auth/logout')
        .expect(HttpStatus.UNAUTHORIZED);

      // Assert
      expect(response.body.message).toBeDefined();
    });

    it('유효하지 않은 토큰으로 로그아웃 시도', async () => {
      // Arrange
      const response = await request(app.getHttpServer())
        .post('/v1/auth/logout')
        .set('Authorization', 'Bearer invalid-token')
        .expect(HttpStatus.UNAUTHORIZED);

      // Assert
      expect(response.body.message).toBeDefined();
    });

    it('이미 로그아웃된 토큰으로 로그아웃 시도', async () => {
      // Arrange
      const signupResponse = await request(app.getHttpServer())
        .post('/v1/auth/signup')
        .send({
          ...signupDto,
          email: 'logout2@example.com',
        })
        .expect(HttpStatus.CREATED);

      const token = signupResponse.body.accessToken;

      // Act
      await request(app.getHttpServer())
        .post('/v1/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(HttpStatus.OK);

      // Act
      const response = await request(app.getHttpServer())
        .post('/v1/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(HttpStatus.UNAUTHORIZED);

      // Assert
      expect(response.body.message).toContain(
        '토큰이 만료되었거나 유효하지 않습니다.',
      );
    });
  });
});
