import { registerAs } from '@nestjs/config';
import { QueueDatabaseConfig } from '../types';

const queueDatabaseConfigObject = registerAs<QueueDatabaseConfig>(
  'queueDatabase',
  () => ({
    host: process.env.QUEUE_DATABASE_CONFIG_HOST,
    port: parseInt(process.env.QUEUE_DATABASE_CONFIG_PORT),
    password: process.env.QUEUE_DATABASE_CONFIG_PASSWORD || undefined,
  }),
);

export { queueDatabaseConfigObject };
