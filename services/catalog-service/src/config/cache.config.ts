import { CacheModuleOptions } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import type { RedisClientOptions } from 'redis';

export const cacheConfig = (): CacheModuleOptions => ({
  isGlobal: true,
  store: redisStore as any,
  host: process.env.REDIS_URL?.split('://')[1]?.split(':')[0] || 'redis',
  port: parseInt(process.env.REDIS_URL?.split(':')[2] || '6379'),
  ttl: parseInt(process.env.CACHE_TTL || '3600'),
} as CacheModuleOptions & RedisClientOptions);