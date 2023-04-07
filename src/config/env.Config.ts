import { registerAs } from '@nestjs/config';
import { envConfig } from '../types';
const envConfigObject = registerAs<envConfig>('envConfig', () => ({
  port: parseInt(process.env.PORT),
  globalPrefix: process.env.GLOBAL_PREFIX || '',
}));

export { envConfigObject };
