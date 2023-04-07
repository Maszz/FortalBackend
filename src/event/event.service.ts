import { ForbiddenException, Injectable, Logger } from '@nestjs/common';
import {
  Log,
  Prisma,
  Event,
  EventChat,
  Region,
  LatLng,
  MemberType,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from '../notification/notification.service';
import { map } from 'rxjs/operators';

interface ICreateEventArgs {
  eventName: string;
  eventDescription: string;
  startDateTime: string;
  endDateTime: string;
  memberType: MemberType;
  memberLimit: number;
  isPublic: boolean;
  eventColors: string[];
  location: Region;
  locationName: string;
  locationDescription: string;
  locationMarker: LatLng;
  creatorUsername: string;
}
interface IAddParticipantArgs {
  eventId: string;
  username: string;
}
@Injectable()
export class EventService {
  constructor(
    private readonly logger: Logger, // initialize logger instance
    private readonly prisma: PrismaService, // initialize prisma instance:
    private readonly notiService: NotificationService,
  ) {}

  async createEvent(
    data: ICreateEventArgs,
  ): Promise<{ event: Event; eventChat: EventChat }> {
    // this.logger.log('createEvent()');
    const event = await this.prisma.event.create({
      data: {
        name: data.eventName,
        description: data.eventDescription,
        startDate: data.startDateTime,
        endDate: data.endDateTime,
        location: data.location,
        locationName: data.locationName,
        locationMarker: data.locationMarker,
        memberType: data.memberType,
        memberLimit: data.memberLimit,
        isPublic: data.isPublic,

        eventColors: {
          c1: data.eventColors[0],
          c2: data.eventColors[1],
        },
        locationDetails: data.locationDescription,
        creator: {
          connect: {
            username: data.creatorUsername,
          },
        },
      },
    });
    const eventChat = await this.prisma.eventChat.create({
      data: {
        event: {
          connect: {
            id: event.id,
          },
        },
      },
    });
    this.notiService.createFollowingNotification(
      `${data.creatorUsername} created a new event`,
      'createEvent',
      data.creatorUsername,
      event.id,
    );
    return { event, eventChat };
  }

  async addPaticipantToEvent(data: IAddParticipantArgs) {
    // TODO
    const { eventId, username } = data;
    console.log(data);

    const creator = await this.prisma.event.findUnique({
      where: {
        id: eventId,
      },
      select: {
        creator: true,
        participants: true,
      },
    });
    if (creator.creator.username === username) {
      console.log('case1');
      throw new ForbiddenException('creator cannot join event');
    }

    if (creator.participants.some((p) => p.username === username)) {
      console.log('case2');
      throw new ForbiddenException('You are already a participant');
      return;
    }
    const event = await this.prisma.event.findUnique({
      where: {
        id: eventId,
      },
    });
    if (
      event.memberType === 'LIMIT' &&
      event.memberLimit <= event.participantsId.length + 1
    ) {
      console.log('case3');
      throw new ForbiddenException('Event is full');
      return;
    }

    const paticipan = await this.prisma.event.update({
      where: {
        id: eventId,
      },
      data: {
        participants: {
          connect: {
            username: username,
          },
        },
      },
    });
    this.notiService.createJoinEventNotification(
      `${username} joined your event`,
      'joinEvent',
      creator.creator.username,
      username,
      eventId,
    );

    const user = await this.prisma.user.update({
      where: {
        username: username,
      },
      data: {
        profile: {
          update: {
            eventCount: {
              increment: 1,
            },
          },
        },
      },
    });
    return paticipan;
  }

  async removePaticipantToEvent(data: IAddParticipantArgs) {
    // TODO
    const { eventId, username } = data;
    const creator = await this.prisma.event.findUnique({
      where: {
        id: eventId,
      },
      select: {
        creator: {
          select: {
            username: true,
          },
        },
      },
    });

    if (creator.creator.username === username) {
      console.log('case1');
      const a = await this.prisma.event.delete({
        where: {
          id: eventId,
        },
      });

      return a;
    }

    const paticipan = await this.prisma.event.update({
      where: {
        id: eventId,
      },
      data: {
        participants: {
          disconnect: {
            username: username,
          },
        },
      },
    });
    return paticipan;
  }

  async getEventByIdForCardDisplay(eventId: string) {
    return await this.prisma.event.findUnique({
      where: {
        id: eventId,
      },

      include: {
        eventChat: {
          select: {
            id: true,
          },
        },
        creator: {
          select: {
            profile: {
              select: {
                avatar: true,
              },
            },
          },
        },
        participants: {
          select: {
            profile: {
              select: {
                avatar: true,
              },
            },
          },
        },
      },
    });
  }

  async getEventList(offset: number, limit: number, username: string) {
    return await this.prisma.event.findMany({
      skip: offset,
      take: limit,
      where: {
        NOT: [
          {
            creator: {
              username: username,
            },
          },
          {
            participants: {
              some: {
                username: username,
              },
            },
          },
        ],
      },
      select: {
        id: true,
        name: true,
        description: true,
        startDate: true,
        eventColors: true,
        participants: {
          select: {
            profile: {
              select: {
                avatar: true,
              },
            },
          },
        },
        creator: {
          select: {
            profile: {
              select: {
                avatar: true,
              },
            },
          },
        },

        eventChat: {
          select: {
            id: true,
          },
        },
      },
    });
  }
  async getEventListForUserCreated(
    offset: number,
    limit: number,
    username: string,
  ) {
    return await this.prisma.event.findMany({
      skip: offset,
      take: limit,
      where: {
        creator: {
          username: username,
        },
      },
      select: {
        id: true,
        name: true,
        description: true,
        startDate: true,
        eventColors: true,
        eventChat: {
          select: {
            id: true,
          },
        },
        participants: {
          select: {
            profile: {
              select: {
                avatar: true,
              },
            },
          },
        },
        creator: {
          select: {
            profile: {
              select: {
                avatar: true,
              },
            },
          },
        },
      },
    });
  }
  async getEventListForUserJoined(
    offset: number,
    limit: number,
    username: string,
  ) {
    return await this.prisma.event.findMany({
      skip: offset,
      take: limit,
      where: {
        participants: {
          some: {
            username: username,
          },
        },
      },
      select: {
        id: true,
        name: true,
        description: true,
        startDate: true,
        eventColors: true,
        eventChat: {
          select: {
            id: true,
          },
        },
        participants: {
          select: {
            profile: {
              select: {
                avatar: true,
              },
            },
          },
        },
        creator: {
          select: {
            profile: {
              select: {
                avatar: true,
              },
            },
          },
        },
      },
    });
  }

  async createEventPost(args: {
    creatorUsername: string;
    content: string;
    eventId: string;
  }) {
    const { creatorUsername, content, eventId } = args;
    const event = await this.prisma.event.findUnique({
      where: {
        id: eventId,
      },
    });

    const post = await this.prisma.eventPost.create({
      data: {
        creator: {
          connect: {
            username: creatorUsername,
          },
        },
        content: content,
        event: {
          connect: {
            id: eventId,
          },
        },
      },
    });
    return post;
  }

  async createEventComment(args: {
    postId: string;
    content: string;
    creatorUsername: string;
  }) {
    const { postId, content, creatorUsername } = args;

    const comment = await this.prisma.eventComment.create({
      data: {
        creator: {
          connect: {
            username: creatorUsername,
          },
        },
        content: content,
        post: {
          connect: {
            id: postId,
          },
        },
      },
    });

    return comment;
  }

  async getEventPostList(args: {
    eventId: string;
    offset: number;
    limit: number;
  }) {
    const { eventId, offset, limit } = args;
    console.log(eventId);
    const posts = await this.prisma.event.findUnique({
      where: {
        id: eventId,
      },
      select: {
        EventPost: {
          select: {
            id: true,
            content: true,
            creator: {
              select: {
                username: true,
              },
            },
            createdAt: true,
          },
        },
      },
    });
    return posts.EventPost.map((p) => {
      return {
        id: p.id,
        content: p.content,
        creator: p.creator.username,
        createdAt: p.createdAt,
      };
    });
  }

  async getEventCommentList(args: {
    offset: number;
    limit: number;
    postId: string;
  }) {
    const { postId, offset, limit } = args;
    const comments = await this.prisma.eventPost.findUnique({
      where: {
        id: postId,
      },
      select: {
        comments: {
          select: {
            id: true,
            content: true,
            creator: {
              select: {
                username: true,
              },
            },
            createdAt: true,
          },
        },
      },
    });
    return comments.comments.map((c) => {
      return {
        id: c.id,
        content: c.content,
        creator: c.creator.username,
        createdAt: c.createdAt,
      };
    });
  }
  async createPinPost(args: {
    eventId: string;
    creatorUsername: string;
    content: string;
  }) {
    const { creatorUsername, content, eventId } = args;
    console.log(args);
    const event = await this.prisma.event.findUnique({
      where: {
        id: eventId,
      },
      select: {
        creator: {
          select: {
            username: true,
          },
        },
      },
    });
    if (!event) {
      throw new Error('Event not found');
    }
    if (event.creator.username !== creatorUsername) {
      throw new Error('You are not the creator of this event');
    }
    const post = await this.prisma.event.update({
      where: {
        id: eventId,
      },
      data: {
        EventPinedPost: {
          upsert: {
            create: {
              content: content,
            },
            update: {
              content: content,
            },
          },
        },
      },
    });
    // console.log(post);
    return post;
  }

  async getPinPost(args: { eventId: string }) {
    const { eventId } = args;
    const post = await this.prisma.event.findUnique({
      where: {
        id: eventId,
      },
      select: {
        creator: {
          select: {
            username: true,
          },
        },
        EventPinedPost: {
          select: {
            id: true,
            content: true,
            createdAt: true,
          },
        },
      },
    });
    return post;
  }

  async getEventMemberById(args: { eventId: string }): Promise<
    {
      id: string;
      username: string;
      avatar: string;
      bio: string;
      displayName: string;
    }[]
  > {
    const { eventId } = args;
    const event = await this.prisma.event.findUnique({
      where: {
        id: eventId,
      },
      select: {
        participants: {
          select: {
            id: true,
            username: true,
            profile: {
              select: {
                avatar: true,
                bio: true,
                displayName: true,
              },
            },
          },
        },
        creator: {
          select: {
            id: true,
            username: true,
            profile: {
              select: {
                avatar: true,
                bio: true,
                displayName: true,
              },
            },
          },
        },
      },
    });
    const members = event.participants.map((p) => {
      return {
        id: p.id,
        username: p.username,
        avatar: p.profile.avatar,
        bio: p.profile.bio,
        displayName: p.profile.displayName,
      };
    });
    const creator = {
      id: event.creator.id,
      username: event.creator.username,
      avatar: event.creator.profile.avatar,
      bio: event.creator.profile.bio,
      displayName: event.creator.profile.displayName,
    };

    const memberArr = [creator, ...members];
    return memberArr;
  }
}
