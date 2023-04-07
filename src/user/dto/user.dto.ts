import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
  @ApiProperty()
  id: string;
  @ApiProperty()
  createdAt: Date;
  @ApiProperty()
  updatedAt: Date;
  @ApiProperty()
  username: string;
  @ApiProperty()
  email: string;
  @ApiProperty()
  eventsJoined: string[];
}
class ProfileRes {
  @ApiProperty()
  realName: string;
  @ApiProperty()
  bio: string;
  @ApiProperty()
  displayName: string;
}
export class UserRespondDto {
  @ApiProperty()
  categories: string[];
  @ApiProperty()
  username: string;
  @ApiProperty()
  profile: ProfileRes;
  // hashpw: string;
  // hashedRt: string | null;
}
