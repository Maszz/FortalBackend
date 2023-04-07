import { ApiProperty } from '@nestjs/swagger';

class AddAndRemoveParticipantDto {
  @ApiProperty()
  eventId: string;
  @ApiProperty()
  username: string;
}

export class AddParticipantDto extends AddAndRemoveParticipantDto {}
export class RemoveParticipantDto extends AddAndRemoveParticipantDto {}
