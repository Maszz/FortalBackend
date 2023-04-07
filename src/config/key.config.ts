import { registerAs } from '@nestjs/config';
import { CacheDatabaseConfig } from '../types';
import { AuthKey } from '../types';
const JwtKeyConfigObject = registerAs<AuthKey>('jwtKey', () => ({
  at_privateKey: Buffer.from(process.env.AT_PRIVATE, 'base64').toString('utf8'),
  at_publicKey: Buffer.from(process.env.AT_PUBLIC, 'base64').toString('utf8'),
  rt_privateKey: Buffer.from(process.env.RT_PRIVATE, 'base64').toString('utf8'),
  rt_publicKey: Buffer.from(process.env.RT_PUBLIC, 'base64').toString('utf8'),
}));

export { JwtKeyConfigObject };
