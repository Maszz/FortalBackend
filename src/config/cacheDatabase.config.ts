import { registerAs } from '@nestjs/config';
import { CacheDatabaseConfig } from '../types';
const cacheDatabaseConfigObject = registerAs<CacheDatabaseConfig>(
  'cacheDatabase',
  () => ({
    ttl: parseInt(process.env.CACHE_DATABASE_CONFIG_TTL) || 5, // seconds
    max: parseInt(process.env.CACHE_DATABASE_CONFIG_MAX) || 10, // maximum number of items in cache
    isGlobal: true,
    host: process.env.CACHE_DATABASE_CONFIG_HOST,
    port: parseInt(process.env.CACHE_DATABASE_CONFIG_PORT),
    password: process.env.CACHE_DATABASE_CONFIG_PASSWORD || undefined,
  }),
);

export { cacheDatabaseConfigObject };
