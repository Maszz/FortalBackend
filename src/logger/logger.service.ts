import { Injectable, Logger } from '@nestjs/common';
import { Log, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
// import { Request } from 'Express';
/**
 * Logger Service Wrapped from nestJS logger.
 * @method `log`
 * @method `error`
 * @method `warn`
 */
@Injectable()
export class LoggerService {
  constructor(
    private readonly logger: Logger, // initialize logger instance
    private readonly prisma: PrismaService, // initialize prisma instance:
  ) {}

  /**
   * Write a `log` level log.
   * @param message message for log.
   * @param context context for log.
   */
  log(message: string, context?: string): void {
    context = context || 'No context';
    this.logger.log(message, context);
    this.createLog({
      level: 'log',
      message: message,
      context: context,
      timestamp: new Date(),
    });
  }
  logWithoutSave(message: string, context?: string): void {
    context = context || 'No context';
    this.logger.log(message, context);
  }

  /**
   *  Write a `error` level log.
   * @param message message message for log.
   * @param stack   stackTrace for information.
   * @param context context for log.
   */
  error(message: string, stack?: string, context?: string): void {
    context = context || 'No context';
    this.logger.error(message, stack, context);
    this.createLog({
      level: 'error',
      message: message,
      context: context,
      timestamp: new Date(),
    });
  }
  /**
   * Write a `warn` level log.
   * @param message message message for log.
   * @param context context for log.
   */
  warn(message: string, context?: string): void {
    context = context || 'No context';
    this.logger.warn(message, context);
    this.createLog({
      level: 'warn',
      message: message,
      context: context,
      timestamp: new Date(),
    });
  }

  debug(message: string, context?: string): void {
    context = context || 'No context';
    this.logger.debug(message, context);
    this.createLog({
      level: 'debug',
      message: message,
      context: context,
      timestamp: new Date(),
    });
  }
  verbose(message: string, context?: string): void {
    context = context || 'No context';
    this.logger.verbose(message, context);
    this.createLog({
      level: 'verbose',
      message: message,
      context: context,
      timestamp: new Date(),
    });
  }
  http(request: any): void {
    this.log(
      `${request.method} ${request.url} - {${request.headers['user-agent']}} - ${request.ip} ${request.protocol}/${request.httpVersion}`,
      'HttpRequest',
    );
  }

  private async createLog(data: Prisma.LogCreateInput): Promise<Log> {
    return this.prisma.log.create({
      data: {
        ...data,
      },
    });
  }
}
