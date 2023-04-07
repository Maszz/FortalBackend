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
  Param,
  Query,
} from '@nestjs/common';
import { ApiProperty, ApiOkResponse, ApiTags } from '@nestjs/swagger';

import { EventService } from './event.service';
import {
  CreateEventDto,
  CreateEventResponseDto,
  GetEventByIdDto,
  EventDto,
} from './dto/create-event.dto';
import { AddParticipantDto, RemoveParticipantDto } from './dto/participant.dto';
import { Event } from '@prisma/client';
@ApiTags('Event')
@Controller('event')
export class EventController {
  constructor(private eventService: EventService) {}

  @Post('/createEvent')
  @ApiOkResponse({
    description: 'The event records ',
    type: CreateEventResponseDto,
  })
  @HttpCode(200)
  async createEvent(
    @Body() createEventParam: CreateEventDto,
  ): Promise<CreateEventResponseDto> {
    // const args = {
    //   name: createEventParam.eventName,
    //   description: createEventParam.description,
    //   location: createEventParam.location,
    //   date: new Date(Date.now()),
    //   creatorUsername: createEventParam.creatorUsername,
    // };
    return this.eventService.createEvent(createEventParam);
  }
  @Get('/getEventList')
  async getEventList(
    @Query('offset') offset: string,
    @Query('limit') limit: string,
    @Query('u') username: string,
    @Query('t') type: string,
  ): Promise<any> {
    if (type === 'home') {
      return this.eventService.getEventList(
        parseInt(offset),
        parseInt(limit),
        username,
      );
    }
    if (type === 'created') {
      return this.eventService.getEventListForUserCreated(
        parseInt(offset),
        parseInt(limit),
        username,
      );
    }
    if (type === 'joined') {
      return this.eventService.getEventListForUserJoined(
        parseInt(offset),
        parseInt(limit),
        username,
      );
    }
    return { e: 'error' };
  }
  @Get('/getEventUserList')
  async getEventUserList(
    @Query('offset') offset: string,
    @Query('limit') limit: string,
    @Query('u') username: string,
    @Query('t') type: string,
  ): Promise<any> {
    if (type === 'created') {
      return this.eventService.getEventListForUserCreated(
        parseInt(offset),
        parseInt(limit),
        username,
      );
    }
    if (type === 'joined') {
      return this.eventService.getEventListForUserJoined(
        parseInt(offset),
        parseInt(limit),
        username,
      );
    }
  }

  @Get('/getEventById')
  async getEventById(@Query('id') id: string): Promise<any> {
    const data = await this.eventService.getEventByIdForCardDisplay(id);
    console.log(data);
    return data;
  }

  @Post('/addParticipant')
  @ApiOkResponse({
    description: 'The event records by id.',
    type: EventDto,
  })
  @HttpCode(200)
  async addParticipant(@Body() args: AddParticipantDto): Promise<any> {
    return this.eventService.addPaticipantToEvent(args);
  }

  @Post('/createPost')
  async createEventPost(@Body() args: CreatePostDto) {
    const post = await this.eventService.createEventPost(args);
    return post;
  }
  @Post('/createPinPost')
  async createPinPost(@Body() args: CreatePinPostDto) {
    return this.eventService.createPinPost(args);
  }

  @Get('/getEventPinedPost')
  async getPinPost(@Query('eventId') eventId: string) {
    return this.eventService.getPinPost({ eventId });
  }

  @Post('/createComment')
  async createEventComment(@Body() args: CreateCommentDto) {
    const comment = await this.eventService.createEventComment(args);
    return comment;
  }

  @Get('/getCommentList')
  async getEventCommentList(
    @Query('offset') offset: number,
    @Query('limit') limit: number,
    @Query('postId') postId: string,
  ) {
    console.log({ offset, limit, postId });
    return this.eventService.getEventCommentList({ offset, limit, postId });
  }

  @Get('/getEventPostList')
  async getEventPostList(
    @Query('offset') offset: number,
    @Query('limit') limit: number,
    @Query('eventId') eventId: string,
  ) {
    return this.eventService.getEventPostList({ offset, limit, eventId });
  }

  @Post('/removeParticipant')
  @ApiOkResponse({
    description: 'The event records by id.',
    type: EventDto,
  })
  @HttpCode(200)
  async removeParticipant(@Body() args: RemoveParticipantDto): Promise<any> {
    return this.eventService.removePaticipantToEvent(args);
  }

  @Get('/getEventMemberById')
  async getEventMemberById(@Query('id') id: string): Promise<
    {
      id: string;
      username: string;
      avatar: string;
      bio: string;
      displayName: string;
    }[]
  > {
    return this.eventService.getEventMemberById({ eventId: id });
  }

  // @ApiOkResponse({
  //   description: 'The event records by id.',
  //   type: GetEventByIdDto,
  // })
  // @Get('/getEvent/:eventId')
  // async getEvent(@Param('eventId') eventId: string): Promise<GetEventByIdDto> {
  //   return this.eventService.getEventById(eventId);
  // }
}

export interface GetPinPostDto {
  eventId: string;
}

export interface CreatePinPostDto {
  eventId: string;
  creatorUsername: string;
  content: string;
}

export interface CreatePostDto {
  eventId: string;
  content: string;
  creatorUsername: string;
}
export interface CreateCommentDto {
  postId: string;
  content: string;
  creatorUsername: string;
}
export interface GetEventPostListDto {
  eventId: string;
  offset: number;
  limit: number;
}
