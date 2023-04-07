import {
  Controller,
  Get,
  Param,
  Post,
  Req,
  Res,
  Query,
  Version,
} from '@nestjs/common';
import { SearchService } from './search.service';
import { RedisService } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { urlencoded } from 'express';
export type SearchContent = {
  content: string;
  type: string;
  id: string;
  date?: string;
  location?: string;
  name?: string;
  bio?: string;
};

export type SearchLocationDto = {
  geometry: {
    lat: number;
    lng: number;
  };
  place: string;
};

@Controller('search')
export class SearchController {
  private readonly redis: Redis;

  constructor(
    private readonly service: SearchService,
    private readonly redisService: RedisService,
  ) {
    this.redis = this.redisService.getClient();
  }

  @Get('keyword')
  async search(
    // @Param() param: { keyword: string },
    @Query('term') term: string,
    @Query('u') username: string,
  ): Promise<SearchContent[]> {
    const cache = await this.redis.get(`search?${term}`);
    if (cache) {
      console.log('cache');
      return Promise.resolve(JSON.parse(cache)) as Promise<SearchContent[]>;
    }
    if (term == '') {
      console.log('empty');
      return Promise.resolve([]);
    }
    const result = await this.service.search({
      keyword: term,
      username: username,
    });
    this.redis.set(`search?${term}`, JSON.stringify(result), 'EX', 10);
    return result;
  }

  @Get('location')
  async searchLocation(
    // @Param() param: { keyword: string },
    @Query('term') term: string,
  ): Promise<SearchLocationDto[]> {
    const cache = await this.redis.get(`searchLocation?${term}`);
    if (cache) {
      console.log('cache');
      return Promise.resolve(JSON.parse(cache)) as Promise<SearchLocationDto[]>;
    }
    if (term == '' || term.length < 2) {
      console.log('empty');
      return Promise.resolve([]);
    }
    // console.log(encodeURIComponent(term));
    const result = await this.service.searchLocation(term);

    this.redis.set(`searchLocation?${term}`, JSON.stringify(result));
    return result;
  }
}
