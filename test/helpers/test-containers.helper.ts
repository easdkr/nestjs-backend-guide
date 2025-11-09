import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { RedisContainer } from '@testcontainers/redis';
import { StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { StartedRedisContainer } from '@testcontainers/redis';

export interface TestContainerConfig {
  postgresUrl: string;
  valkeyHost: string;
  valkeyPort: number;
}

let postgresContainer: StartedPostgreSqlContainer | null = null;
let redisContainer: StartedRedisContainer | null = null;

export async function startTestContainers(): Promise<TestContainerConfig> {
  const postgres = await new PostgreSqlContainer('postgres:latest')
    .withDatabase('commerce')
    .withUsername('postgres')
    .withPassword('postgres')
    .start();

  const redis = await new RedisContainer('valkey/valkey:latest')
    .withCommand(['valkey-server', '--appendonly', 'yes'])
    .start();

  postgresContainer = postgres;
  redisContainer = redis;

  const postgresUrl = postgres.getConnectionUri();
  const valkeyHost = redis.getHost();
  const valkeyPort = redis.getPort();

  return {
    postgresUrl,
    valkeyHost,
    valkeyPort,
  };
}

export async function stopTestContainers(): Promise<void> {
  if (postgresContainer) {
    await postgresContainer.stop();
    postgresContainer = null;
  }

  if (redisContainer) {
    await redisContainer.stop();
    redisContainer = null;
  }
}
