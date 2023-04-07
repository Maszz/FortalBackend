import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User, Prisma } from '@prisma/client';
import { UnfollowingUserByidParams } from './user.controller';
import { RemoveFollowerByIdParams } from './user.controller';
import {
  UpdateOnboardingParams,
  UpdateOnboardingGenderParams,
} from './user.controller';
import { NotificationService } from '../notification/notification.service';
interface IUpdateProfileParamsArgs {
  profile: {
    bio?: string;
    displayName?: string;
    isProfilePublic?: boolean;
  };
  newTags: string[];
  removeTags: string[];
  username: string;
  cUsername: string;
}
@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notiService: NotificationService,
  ) {}
  getData(): { message: string } {
    return { message: 'Welcome to backend!' };
  }

  async user(
    userWhereUniqueInput: Prisma.UserWhereUniqueInput,
    // includeInput: Prisma.UserInclude | null = null,
  ): Promise<Prisma.Prisma__UserClient<User & unknown>> {
    return this.prisma.user.findUnique({
      where: userWhereUniqueInput,
      // include: includeInput,
    });
  }

  async getUserByuserName(username: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        username: username,
      },

      select: {
        _count: {
          select: {
            followedBy: true,
            following: true,
          },
        },
        username: true,
        profile: {
          select: {
            realName: true,
            bio: true,
            displayName: true,
            isProfilePublic: true,
            eventCount: true,
            avatar: true,
            colors: true,
          },
        },
        categories: {
          select: {
            name: true,
          },
        },
      },
    });
    console.log(user);

    const tags = user.categories.map((category) => category.name);
    return {
      ...user,
      categories: tags,
    };

    return;
  }

  async users(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.UserWhereUniqueInput;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }): Promise<User[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.user.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async createUser(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user
      .create({
        data,
      })
      .catch((error) => {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === 'P2002') {
            throw new ForbiddenException('Credentials incorrect');
          }
        }
        throw error;
      });
  }

  async updateUser(params: {
    where: Prisma.UserWhereUniqueInput;
    data: Prisma.UserUpdateInput;
  }): Promise<User> {
    const { where, data } = params;
    return this.prisma.user.update({
      data,
      where,
    });
  }

  async updateProfile(args: IUpdateProfileParamsArgs) {
    const {
      username,
      profile: userProfile,
      cUsername,
      newTags,
      removeTags,
    } = args;
    const formatedCreateOrContectTags = newTags.map((tag) => {
      return { where: { name: tag }, create: { name: tag } };
    });
    const formatedDisconnectedTags = removeTags.map((tag) => {
      return { name: tag };
    });
    console.log(userProfile);
    console.log(username);

    if (cUsername !== username) {
      const user = await this.prisma.user
        .update({
          where: {
            username: cUsername,
          },
          data: {
            username: username,
          },
        })
        .catch((error) => {
          console.log(error);
          if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
              throw new ForbiddenException('this username is already taken');
            }
          }
          throw error;
        });

      const profile = await this.prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          profile: {
            update: userProfile,
          },
          categories: {
            connectOrCreate: formatedCreateOrContectTags,
            disconnect: formatedDisconnectedTags,
          },
        },
      });
      return { profile, updateUsername: true };
    }
    const profile = await this.prisma.user.update({
      where: {
        username: username,
      },
      data: {
        profile: {
          update: userProfile,
        },
        categories: {
          connectOrCreate: formatedCreateOrContectTags,
          disconnect: formatedDisconnectedTags,
        },
      },
    });

    return { profile, updateUsername: false };
  }

  async UpdateOnboarding(args: UpdateOnboardingParams) {
    const { onboarding, userId } = args;
    return this.prisma.user.update({
      where: {
        username: userId,
      },
      data: {
        onboarding: onboarding,
      },
    });
  }

  async UpdateOnboardingGender(args: UpdateOnboardingGenderParams) {
    const { gender, userId } = args;
    return this.prisma.user.update({
      where: {
        username: userId,
      },
      data: {
        profile: {
          update: {
            gender: gender,
          },
        },
      },
    });
  }

  async setCategoryToUser({
    tags,
    userId,
  }: {
    tags: string[];
    userId: string;
  }) {
    const categoryId = await this.prisma.category.findMany({
      where: {
        name: {
          in: tags,
        },
      },
      select: {
        id: true,
        // name: true,
      },
    });
    await this.prisma.user.update({
      where: {
        username: userId,
      },
      data: {
        // categoryIDs: {
        //   set: categoryId.map((category) => category.id),
        // },

        categories: {
          connect: categoryId,
        },
      },
    });
  }

  async getTags() {
    return this.prisma.category.findMany({
      select: {
        name: true,
      },
    });
  }

  async followingUserByid(args: { userId: string; followingUserId: string }) {
    const { userId, followingUserId } = args;
    console.log(userId, followingUserId);
    const user = await this.prisma.user.findUnique({
      where: {
        id: followingUserId,
      },
      select: {
        profile: {
          select: {
            isProfilePublic: true,
          },
        },
      },
    });
    console.log(user.profile);
    if (userId == followingUserId) {
      throw new ForbiddenException('you can not follow yourself');
    }
    if (!user.profile.isProfilePublic) {
      // throw new ForbiddenException('this user is private');
      console.log('this user is private');
      const res = await this.followingRequest({
        followerId: userId,
        followingId: followingUserId,
      });
      return res;
    }

    return this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        following: {
          connect: {
            id: followingUserId,
          },
        },
      },
    });
  }

  async getFollowers(username: string): Promise<any> {
    // TODO
    const user = await this.prisma.user.findUnique({
      where: {
        username: username,
      },
      select: {
        followedBy: {
          select: {
            id: true,
            username: true,
            profile: {
              select: {
                displayName: true,
                bio: true,
              },
            },
          },
        },
      },
    });

    const formattedFollowers = user.followedBy.map((follower) => {
      return {
        id: follower.id,
        username: follower.username,
        displayName: follower.profile.displayName,
        bio: follower.profile.bio,
      };
    });
    return formattedFollowers;
  }

  async getFollowing(username: string): Promise<any> {
    // TODO
    console.log(username);
    const user = await this.prisma.user.findUnique({
      where: {
        username: username,
      },
      select: {
        following: {
          select: {
            id: true,
            username: true,
            profile: {
              select: {
                bio: true,
                displayName: true,
              },
            },
          },
        },
      },
    });
    console.log(user);

    const formattedFollowers = user.following.map((follower) => {
      return {
        id: follower.id,
        username: follower.username,
        displayName: follower.profile.displayName,
        bio: follower.profile.bio,
      };
    });
    return formattedFollowers;
  }

  async getFollowCount(username: string): Promise<any> {
    // TODO
    const user = await this.prisma.user.findUnique({
      where: {
        username: username,
      },
      select: {
        _count: {
          select: {
            followedBy: true,
            following: true,
          },
        },
        FollowingRequestBy: {
          where: {
            status: 'pending',
          },
          select: {
            id: true,
          },
        },
      },
    });
    const followingRequestBy = user.FollowingRequestBy.length;

    return { ...user._count, followingRequestBy };
  }

  async followingRequest(args: { followerId: string; followingId: string }) {
    const followingRequest = await this.prisma.followingRequest.create({
      data: {
        From: {
          connect: {
            id: args.followerId,
          },
        },
        To: {
          connect: {
            id: args.followingId,
          },
        },
      },
    });
    const user = await this.prisma.user.findUnique({
      where: {
        id: args.followerId,
      },
      select: {
        username: true,
      },
    });
    await this.notiService.createNotificationFollowingRequest(
      `${user.username} wants to follow you`,
      'followingRequest',
      args.followingId,
      args.followerId,
    );
    return followingRequest;
  }

  async getFollowingRequest(username: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        username: username,
      },
      select: {
        FollowingRequestTo: {
          where: {
            status: 'pending',
          },
          select: {
            To: {
              select: {
                username: true,
              },
            },
          },
        },
      },
    });
    const formattedFollowingRequest = user.FollowingRequestTo.map((request) => {
      return request.To.username;
    });
    return formattedFollowingRequest;
  }

  async getFollowingRequestFrom(username: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        username: username,
      },
      select: {
        FollowingRequestBy: {
          where: {
            status: 'pending',
          },
          select: {
            id: true,
            To: {
              select: {
                username: true,
                profile: {
                  select: {
                    displayName: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    const formattedFollowingRequestFrom = user.FollowingRequestBy.map(
      (request) => {
        return {
          id: request.id,
          username: request.To.username,
          displayName: request.To.profile.displayName,
        };
      },
    );
    return formattedFollowingRequestFrom;
  }

  async handleFollowingRequest(args: {
    requestId: string;
    status: 'accepted' | 'rejected';
  }) {
    const { requestId } = args;
    console.log(args);

    const request = await this.prisma.followingRequest.update({
      where: {
        id: requestId,
      },
      data: {
        status: args.status,
      },
    });
    if (request.status == 'accepted') {
      return await this.prisma.user.update({
        where: {
          id: request.toIDs,
        },
        data: {
          followedBy: {
            connect: {
              id: request.fromIDs,
            },
          },
        },
      });
    }
    return request;
  }

  async unfollowingUserByid(args: UnfollowingUserByidParams) {
    const { followerId, unfollowingId } = args;
    return this.prisma.user.update({
      where: {
        id: followerId,
      },
      data: {
        following: {
          disconnect: {
            id: unfollowingId,
          },
        },
      },
    });
  }
  async removeFollowerById(args: RemoveFollowerByIdParams) {
    const { followerId, userId } = args;
    return this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        followedBy: {
          disconnect: {
            id: followerId,
          },
        },
      },
    });
  }
  async getNotifications(username: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        username: username,
      },
      select: {
        Notifications: {
          select: {
            creator: {
              select: {
                username: true,
              },
            },
            message: true,
          },
        },
      },
    });
    return user.Notifications;
  }

  async getAvatar(username: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        username: username,
      },
      select: {
        profile: {
          select: {
            avatar: true,
          },
        },
      },
    });
    console.log(user);
    return user.profile.avatar;
  }
}
