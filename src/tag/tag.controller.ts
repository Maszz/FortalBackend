import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { Response } from 'express';
import { TagService } from './tag.service';
@Controller('tags')
export class TagController {
  constructor(private readonly service: TagService) {}

  @Get()
  getAllTags(): Promise<string[]> {
    return this.service.getAllTags();
  }

  @Get('set')
  setPrimaryTag(): Promise<void> {
    return this.service.setPrimaryTag();
  }

  // @Post()
  // addTag(@Body() body: any): Promise<void> {
  //   return this.service.addTag(body);
  // }
}
