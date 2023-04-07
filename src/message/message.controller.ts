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
import { MessageService } from './message.service';
interface SendMessageToChatDto {
  senderName: string;
  message: string;
  eventChatId: string;
  date: string;
}
@Controller('message')
export class MessageController {
  constructor(private messageService: MessageService) {}

  @Post('/sendMessageToChat')
  @HttpCode(200)
  async sendMessage(@Body() args: SendMessageToChatDto): Promise<any> {
    const date = new Date(args.date);
    return this.messageService.sentMessageToEventChatByEventChatId({
      senderName: args.senderName,
      message: args.message,
      eventChatId: args.eventChatId,
      date: date,
    });
  }

  @Get('/getMessagesByEventId')
  @HttpCode(200)
  async getMessagesByEventId(@Body() args: { eventId: string }): Promise<any> {
    return this.messageService.getMessagesByEventChatId(args.eventId);
  }
}
