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

describe('UserController (e2e)', () => {
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

  describe('GET /v1/users/me', () => {
    const signupDto: CreateUserDto = {
      email: 'me@example.com',
      password: 'Me1234!@',
      nickname: 'meuser',
      birthDate: '1990-01-01',
      gender: Gender.MALE,
      termsAgreed: true,
      marketingAgreed: false,
    };

    let cookies: string[];

    beforeAll(async () => {
      const signupResponse = await request(app.getHttpServer())
        .post('/v1/auth/signup')
        .send(signupDto)
        .expect(201);

      const setCookieHeader = signupResponse.headers['set-cookie'];
      cookies = Array.isArray(setCookieHeader)
        ? setCookieHeader
        : setCookieHeader
          ? [setCookieHeader]
          : [];
    });

    it('정상적인 내 정보 조회 요청', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .get('/v1/users/me')
        .set('Cookie', cookies)
        .expect(HttpStatus.OK);

      // Assert
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('email', signupDto.email);
      expect(response.body).toHaveProperty('nickname', signupDto.nickname);
      expect(response.body).toHaveProperty('birthDate');
      expect(response.body).toHaveProperty('gender', signupDto.gender);
      expect(response.body).toHaveProperty(
        'termsAgreed',
        signupDto.termsAgreed,
      );
      expect(response.body).toHaveProperty(
        'marketingAgreed',
        signupDto.marketingAgreed,
      );
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');
    });

    it('인증 토큰 없이 내 정보 조회 시도', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .get('/v1/users/me')
        .expect(HttpStatus.UNAUTHORIZED);

      // Assert
      expect(response.body.message).toBeDefined();
    });

    it('유효하지 않은 토큰으로 내 정보 조회 시도', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .get('/v1/users/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(HttpStatus.UNAUTHORIZED);

      // Assert
      expect(response.body.message).toBeDefined();
    });

    it('이미 로그아웃된 토큰으로 내 정보 조회 시도', async () => {
      // Arrange
      const signupResponse = await request(app.getHttpServer())
        .post('/v1/auth/signup')
        .send({
          ...signupDto,
          email: 'me2@example.com',
        })
        .expect(201);

      const setCookieHeader = signupResponse.headers['set-cookie'];
      const signupCookies = Array.isArray(setCookieHeader)
        ? setCookieHeader
        : setCookieHeader
          ? [setCookieHeader]
          : [];

      // Act - 로그아웃
      await request(app.getHttpServer())
        .post('/v1/auth/logout')
        .set('Cookie', signupCookies)
        .expect(HttpStatus.OK);

      // Act - 로그아웃된 토큰으로 조회 시도
      const response = await request(app.getHttpServer())
        .get('/v1/users/me')
        .set('Cookie', signupCookies)
        .expect(HttpStatus.UNAUTHORIZED);

      // Assert
      expect(response.body.message).toContain(
        '토큰이 만료되었거나 유효하지 않습니다.',
      );
    });
  });
});
