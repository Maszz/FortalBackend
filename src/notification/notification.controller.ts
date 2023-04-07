import { NotificationService } from './notification.service';
import {
  Controller,
  Post,
  UseGuards,
  Req,
  Get,
  Body,
  UsePipes,
  ValidationPipe,
  Res,
  HttpCode,
} from '@nestjs/common';
@Controller('notification')
export class NotificationController {
  constructor(private notificationService: NotificationService) {}
}
