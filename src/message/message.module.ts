import { Module, CacheInterceptor } from '@nestjs/common';
import { MessageResolver } from './message.resolver';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
@Module({
  imports: [],
  controllers: [MessageController],
  providers: [MessageService, MessageResolver],
  exports: [],
})
export class MessageModule {}
