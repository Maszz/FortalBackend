import { Module, CacheInterceptor } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';

import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggerModule } from '../logger/logger.module';
import { NotificationModule } from '../notification/notification.module';
@Module({
  imports: [NotificationModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
