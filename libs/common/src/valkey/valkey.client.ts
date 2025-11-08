import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
  Inject,
} from '@nestjs/common';
import type Redis from 'iovalkey';
import RedisClient from 'iovalkey';
import type { RedisOptions } from 'iovalkey';
import type { ValkeyModuleOptions } from './valkey.interface';
import { VALKEY_MODULE_OPTIONS } from './valkey.constants';

@Injectable()
export class ValkeyClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ValkeyClient.name);
  private client: Redis | null = null;

  constructor(
    @Inject(VALKEY_MODULE_OPTIONS)
    private readonly options: ValkeyModuleOptions,
  ) {}

  async onModuleInit() {
    try {
      const config: RedisOptions = {
        lazyConnect: true,
      };

      if (this.options.url) {
        config.host = this.options.url;
      } else {
        config.host = this.options.host || 'localhost';
        config.port = this.options.port || 6379;
        config.connectTimeout = this.options.connectTimeout || 10000;
      }

      if (this.options.password) {
        config.password = this.options.password;
      }

      if (this.options.db !== undefined) {
        config.db = this.options.db;
      }

      if (this.options.commandTimeout) {
        config.commandTimeout = this.options.commandTimeout;
      }

      if (this.options.maxRetriesPerRequest !== undefined) {
        config.maxRetriesPerRequest = this.options.maxRetriesPerRequest;
      }

      if (this.options.enableReadyCheck !== undefined) {
        config.enableReadyCheck = this.options.enableReadyCheck;
      }

      if (this.options.enableOfflineQueue !== undefined) {
        config.enableOfflineQueue = this.options.enableOfflineQueue;
      }

      if (this.options.lazyConnect !== undefined) {
        config.lazyConnect = this.options.lazyConnect;
      }

      if (this.options.retryStrategy) {
        config.retryStrategy = this.options.retryStrategy;
      }

      this.client = new RedisClient(config);

      this.client.on('error', (err: Error) => {
        this.logger.error(`Valkey Client Error: ${err.message}`, err.stack);
      });

      this.client.on('connect', () => {
        this.logger.log('Valkey Client Connected');
      });

      this.client.on('ready', () => {
        this.logger.log('Valkey Client Ready');
      });

      this.client.on('reconnecting', () => {
        this.logger.warn('Valkey Client Reconnecting');
      });

      if (this.options.lazyConnect !== false) {
        await this.client.connect();
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Failed to initialize Valkey Client: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.quit();
      this.logger.log('Valkey Client Disconnected');
    }
  }

  getClient(): Redis {
    return this.client!;
  }

  async get(key: string): Promise<string | null> {
    return this.client!.get(key);
  }

  async set(
    key: string,
    value: string,
    options?: { EX?: number; PX?: number },
  ): Promise<'OK' | null> {
    if (options?.EX !== undefined) {
      return this.client!.set(key, value, 'EX', options.EX);
    }
    if (options?.PX !== undefined) {
      return this.client!.set(key, value, 'PX', options.PX);
    }
    return this.client!.set(key, value);
  }

  async del(...keys: string[]): Promise<number> {
    return this.client!.del(...keys);
  }

  async exists(...keys: string[]): Promise<number> {
    return this.client!.exists(...keys);
  }

  async expire(key: string, seconds: number): Promise<number> {
    return this.client!.expire(key, seconds);
  }

  async ttl(key: string): Promise<number> {
    return this.client!.ttl(key);
  }

  async keys(pattern: string): Promise<string[]> {
    return this.client!.keys(pattern);
  }

  async hGet(key: string, field: string): Promise<string | null> {
    return this.client!.hget(key, field);
  }

  async hSet(key: string, field: string, value: string): Promise<number> {
    return this.client!.hset(key, field, value);
  }

  async hGetAll(key: string): Promise<Record<string, string>> {
    return this.client!.hgetall(key);
  }

  async hDel(key: string, ...fields: string[]): Promise<number> {
    return this.client!.hdel(key, ...fields);
  }
}
