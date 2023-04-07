import { ApiProperty, ApiOkResponse } from '@nestjs/swagger';
import { Event, EventChat, User } from '@prisma/client';
import { UserDto } from '../../user/dto/user.dto';
import { Region, LatLng, MemberType } from '@prisma/client';
// import { Event } from '@prisma/client';
export class CreateEventDto {
  @ApiProperty()
  eventName: string;
  @ApiProperty()
  eventDescription: string;
  @ApiProperty()
  startDateTime: string;
  @ApiProperty()
  endDateTime: string;
  @ApiProperty()
  memberType: MemberType;
  @ApiProperty()
  memberLimit: number;
  @ApiProperty()
  isPublic: boolean;
  @ApiProperty()
  eventColors: string[];
  @ApiProperty()
  location: Region;
  @ApiProperty()
  locationName: string;
  @ApiProperty()
  locationDescription: string;
  @ApiProperty()
  locationMarker: LatLng;
  @ApiProperty()
  creatorUsername: string;
}

export class EventChatDto {
  @ApiProperty()
  id: string;
  @ApiProperty()
  updatedAt: Date;
  @ApiProperty()
  eventId: string;
}
export class EventDto {
  @ApiProperty()
  id: string;
  @ApiProperty()
  createdAt: Date;
  @ApiProperty()
  updatedAt: Date;
  @ApiProperty()
  name: string;
  @ApiProperty()
  date: Date;
  @ApiProperty()
  location: string;
  @ApiProperty()
  description: string;
  @ApiProperty()
  creatorId: string;
  @ApiProperty()
  participantsId: string[];
}
export class CreateEventResponseDto {
  @ApiProperty({ type: EventDto })
  event: Event;
  @ApiProperty({ type: EventChatDto })
  eventChat: EventChatDto;
}
export class GetEventByIdDto extends EventDto {
  @ApiProperty()
  creator: UserDto;
  @ApiProperty({ type: [UserDto] })
  participants: UserDto[];
  @ApiProperty()
  eventChat: EventChatDto;
}
