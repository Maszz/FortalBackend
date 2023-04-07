import {
  Controller,
  Get,
  Req,
  Res,
  Param,
  Post,
  Body,
  HttpCode,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserDto, UserRespondDto } from './dto/user.dto';

import { LoggerService } from '../logger/logger.service';
import { User, Prisma, FollowingRequest } from '@prisma/client';
import { UserUpdateProfileDto } from './dto/user-update-profile.dto';
import { ApiProperty, ApiOkResponse, ApiTags } from '@nestjs/swagger';

interface GetUserRes {
  categories: string[];
  username: string;
  _count: {
    followedBy: number;
    following: number;
  };
  profile: {
    realName: string;
    bio: string;
    displayName: string;
    isProfilePublic: boolean;
    eventCount: number;
    avatar: string;
    colors: {
      c1: string;
      c2: string;
    };
  };
}

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly logger: LoggerService,
  ) {}

  // @Get()
  // @ApiOkResponse({
  //   description: 'User response',
  //   type: [UserRespondDto],
  // })
  // async getAllUsers(): Promise<UserRespondDto[]> {
  //   const data = this.userService.users({});
  //   return data;
  // }

  @Get('getUserByUsername')
  @ApiOkResponse({
    description: 'User response',
    type: UserRespondDto || 'User not found',
  })
  async getUser(
    @Query('username') username: string,
  ): Promise<GetUserRes | 'User not found'> {
    const user =
      (await this.userService.getUserByuserName(username)) || 'User not found';
    return user;
  }

  @Post('update/profile')
  @ApiOkResponse({
    description: 'User response',
    type: UserDto,
  })
  @HttpCode(200)
  async updateUserProfile(@Body() args: UserUpdateProfileDto): Promise<{
    profile: User;
    updateUsername: boolean;
  }> {
    // TODO
    const user = await this.userService.updateProfile(args);
    return user;
  }

  @Post('update/onboarding')
  @HttpCode(200)
  async updateUserOnboarding(
    @Body() args: UpdateOnboardingParams,
  ): Promise<{ result: boolean }> {
    // TODO
    const user = await this.userService.UpdateOnboarding(args);
    return { result: user.onboarding };
  }
  @Post('update/onboarding/gender')
  @HttpCode(200)
  async updateUserOnboardingGender(
    @Body() args: UpdateOnboardingGenderParams,
  ): Promise<{ result: boolean }> {
    // TODO
    const user = await this.userService.UpdateOnboardingGender(args);
    return { result: true };
  }
  @Post('update/tags')
  @HttpCode(200)
  async updateTags(
    @Body() args: UpdateTagsParams,
  ): Promise<{ result: boolean }> {
    // TODO
    const user = await this.userService.setCategoryToUser(args);
    return { result: true };
  }
  @Get('tags')
  @HttpCode(200)
  async getTags(): Promise<{ name: string }[]> {
    // TODO
    const tags = await this.userService.getTags();
    tags.map((tag) => {
      return tag.name;
    });
    return tags;
  }

  @Get('followers')
  async getFollowers(@Query('u') username: string): Promise<any> {
    // TODO
    const user = await this.userService.getFollowers(username);
    return user;
  }
  @Get('following')
  async getFollowing(@Query('u') username: string): Promise<any> {
    // TODO
    const user = await this.userService.getFollowing(username);
    return user;
  }
  @Get('followCount')
  async getFollowCount(@Query('u') username: string): Promise<any> {
    // TODO
    const user = await this.userService.getFollowCount(username);
    console.log(user);
    return user;
  }

  @Post('followingUserByid')
  async followingUserByid(
    @Body() args: FollowingUserByidParams,
  ): Promise<User | FollowingRequest> {
    // TODO
    const user = await this.userService.followingUserByid(args);

    return user;
  }

  @Post('follwingRequest')
  async follwingRequest(@Body() args: FollwingRequestParams): Promise<any> {
    const user = await this.userService.followingRequest(args);
    return user;
  }
  @Get('getFollowingRequestTo')
  async getFollowingRequest(@Query('u') username: string): Promise<any> {
    const user = await this.userService.getFollowingRequest(username);

    return user;
  }
  @Get('getFollowingRequestFrom')
  async getFollowingRequestFrom(@Query('u') username: string): Promise<
    {
      username: string;
      displayName: string;
      id: string;
    }[]
  > {
    const user = await this.userService.getFollowingRequestFrom(username);

    return user;
  }
  @Post('handleFollowingRequest')
  async handleFollowingRequest(
    @Body() args: HandleFollowingRequestParams,
  ): Promise<any> {
    // TODO
    const user = await this.userService.handleFollowingRequest(args);
    return user;
  }

  @Post('unFollowingById')
  async unfollowingUserByid(
    @Body() args: UnfollowingUserByidParams,
  ): Promise<any> {
    // TODO
    const user = await this.userService.unfollowingUserByid(args);
    return user;
  }

  @Post('removeFollowerById')
  async removeFollowerById(
    @Body() args: RemoveFollowerByIdParams,
  ): Promise<any> {
    const user = await this.userService.removeFollowerById(args);
    return user;
  }

  @Get('getNotifications')
  async getNotifications(@Query('u') username: string): Promise<any> {
    const user = await this.userService.getNotifications(username);
    return user;
  }

  @Get('getAvatar')
  async getAvatar(@Query('u') username: string): Promise<any> {
    const user = await this.userService.getAvatar(username);
    return { avatar: user };
  }
}
export interface RemoveFollowerByIdParams {
  userId: string;
  followerId: string;
}

export interface UnfollowingUserByidParams {
  followerId: string;
  unfollowingId: string;
}
export interface HandleFollowingRequestParams {
  requestId: string;
  status: 'accepted' | 'rejected';
}
export interface FollwingRequestParams {
  followerId: string;
  followingId: string;
}
export interface FollowingUserByidParams {
  userId: string;
  followingUserId: string;
}

export interface UpdateOnboardingParams {
  onboarding: boolean;
  userId: string;
}
export interface UpdateOnboardingGenderParams {
  gender: string;
  userId: string;
}
export interface UpdateTagsParams {
  tags: string[];
  userId: string;
}
