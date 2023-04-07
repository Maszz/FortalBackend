import { NestFactory } from '@nestjs/core';
import {
  utilities as nestWinstonModuleUtilities,
  WinstonModule,
} from 'nest-winston';
import * as winston from 'winston';
// import 'winston-mongodb';

/**
 * Winston Logger Instnace.
 *
 *
 */
const winstonLogger = WinstonModule.createLogger({
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.ms(),
        nestWinstonModuleUtilities.format.nestLike('App', {
          prettyPrint: true,
        }),
      ),
    }),
    // new winston.transports.MongoDB({
    //   db: process.env.MONGO_URI_NAS,
    //   options: {
    //     useUnifiedTopology: true,
    //   },
    //   collection: 'logs',
    // }),
  ],
});

export { winstonLogger };
