import { AppService } from './app.service';
import { Controller, Get, Req, Res } from '@nestjs/common';
import { Response } from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
  @Get('api-docs')
  getApiDocs(@Res() res: Response): void {
    return res.redirect('/sf341-docs');
  }
}
