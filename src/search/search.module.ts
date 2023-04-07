import { Module, CacheInterceptor } from '@nestjs/common';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { HttpModule } from '@nestjs/axios';
@Module({
  imports: [HttpModule],
  controllers: [SearchController],
  providers: [SearchService],
  exports: [],
})
export class SearchModule {}
