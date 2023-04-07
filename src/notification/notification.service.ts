import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationService {
  constructor(private prisma: PrismaService) {}

  async createFollowingNotification(
    msg: string,
    ctx: any,
    username: string,
    refId: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: {
        username: username,
      },
      select: {
        followedByIDs: true,
      },
    });
    const formattedArr = user.followedByIDs.map((id) => {
      return { id: id };
    });

    const notification = await this.prisma.notification.create({
      data: {
        type: ctx,
        message: msg,
        creator: {
          connect: {
            username: username,
          },
        },
        users: {
          connect: formattedArr,
        },
        refID: refId,
      },
    });
    return notification;
  }

  async createNotificationFollowingRequest(
    msg: string,
    ctx: any,
    userId: string,
    creatorId: string,
  ) {
    const notification = await this.prisma.notification.create({
      data: {
        type: ctx,
        message: msg,
        creator: {
          connect: {
            id: creatorId,
          },
        },
        users: {
          connect: [
            {
              id: userId,
            },
          ],
        },
        refID: creatorId,
      },
    });
    return notification;
  }

  async createJoinEventNotification(
    msg: string,
    ctx: string,
    userId: string,
    creatorId: string,
    ref: string,
  ) {
    const notification = await this.prisma.notification.create({
      data: {
        type: ctx,
        message: msg,
        creator: {
          connect: {
            username: creatorId,
          },
        },
        users: {
          connect: [
            {
              username: userId,
            },
          ],
        },
        refID: ref,
      },
    });
    return notification;
  }
}
