import { Module, Logger, Global } from '@nestjs/common';
import { LoggerService } from './logger.service';
import { LoggerMiddleware } from './logger.middleware';
import { PrismaModule } from '../prisma/prisma.module';
/**
 * Logger Module for reuse Logger service provider.
 * @warning Don't direct use logger from nestJS, because it will get duplicated
 * import providers from all childs module in project.
 * `NestJS Recommended to exports Service then import it as module in another module.`
 *  @warning Only `morgan.middleware` and `Logger` in main.ts that directly use Logger
 * from NestJs because It not under the NestJS Module.
 * @providers `LoggerService`,`Logger`
 * @exports `LoggerService`
 */
@Global()
@Module({
  imports: [PrismaModule],
  controllers: [],
  providers: [LoggerService, LoggerMiddleware, Logger],
  exports: [LoggerService, LoggerMiddleware],
})
export class LoggerModule {}
