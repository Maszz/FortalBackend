import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { LoggerService } from './logger.service';
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(private readonly logger: LoggerService) {}
  use(req: Request, res: Response, next: NextFunction): void {
    const copyReq = {} as Request;
    Object.assign(copyReq, req);
    /** @Filttering filterIntrospector request out of saving in to db*/
    if (copyReq.method === 'POST' && copyReq.url === '/graphql') {
      this.logger.logWithoutSave(
        `${req.method} ${req.url} - {${req.headers['user-agent']}} - ${req.ip} ${req.protocol}/${req.httpVersion}`,
        'GrahpqlRequest',
      );
      next();
      return;
    }

    this.logger.http(req);
    next();
  }
}
