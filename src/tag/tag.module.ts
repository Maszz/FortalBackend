import { Module, CacheInterceptor } from '@nestjs/common';
import { TagController } from './tag.controller';
import { TagService } from './tag.service';
@Module({
  controllers: [TagController],
  providers: [TagService],
  exports: [],
})
export class TagModule {}
