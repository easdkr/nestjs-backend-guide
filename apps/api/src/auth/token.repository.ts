import { Injectable } from '@nestjs/common';
import { ValkeyClient } from '@libs/common/valkey/valkey.client';

@Injectable()
export class TokenRepository {
  private readonly ACCESS_TOKEN_PREFIX = 'token:access:';
  private readonly REFRESH_TOKEN_PREFIX = 'token:refresh:';
  private readonly ACCESS_TOKEN_TTL = 3600; // 1시간
  private readonly REFRESH_TOKEN_TTL = 604800; // 7일

  constructor(private readonly valkeyClient: ValkeyClient) {}

  async saveAccessToken(userId: number, token: string): Promise<void> {
    const key = `${this.ACCESS_TOKEN_PREFIX}${userId}`;
    await this.valkeyClient.set(key, token, { EX: this.ACCESS_TOKEN_TTL });
  }

  async saveRefreshToken(userId: number, token: string): Promise<void> {
    const key = `${this.REFRESH_TOKEN_PREFIX}${userId}`;
    await this.valkeyClient.set(key, token, { EX: this.REFRESH_TOKEN_TTL });
  }

  async getAccessToken(userId: number): Promise<string | null> {
    const key = `${this.ACCESS_TOKEN_PREFIX}${userId}`;
    return this.valkeyClient.get(key);
  }

  async getRefreshToken(userId: number): Promise<string | null> {
    const key = `${this.REFRESH_TOKEN_PREFIX}${userId}`;
    return this.valkeyClient.get(key);
  }

  async deleteAccessToken(userId: number): Promise<void> {
    const key = `${this.ACCESS_TOKEN_PREFIX}${userId}`;
    await this.valkeyClient.del(key);
  }

  async deleteRefreshToken(userId: number): Promise<void> {
    const key = `${this.REFRESH_TOKEN_PREFIX}${userId}`;
    await this.valkeyClient.del(key);
  }

  async deleteAllTokens(userId: number): Promise<void> {
    await Promise.all([
      this.deleteAccessToken(userId),
      this.deleteRefreshToken(userId),
    ]);
  }

  async verifyToken(userId: number, token: string): Promise<boolean> {
    const storedToken = await this.getAccessToken(userId);
    return storedToken === token;
  }
}

