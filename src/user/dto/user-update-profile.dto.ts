import { ApiProperty } from '@nestjs/swagger';

export class UserUpdateProfileDto {
  username: string;
  cUsername: string;
  profile: {
    bio?: string;
    displayName?: string;
    isProfilePublic?: boolean;
    colors?: {
      c1?: string;
      c2?: string;
    };
  };
  newTags: string[];
  removeTags: string[];
}
