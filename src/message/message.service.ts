import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Message, Prisma } from '@prisma/client';
interface ISendMessageToChatArgs {
  senderName: string;
  message: string;
  eventChatId: string;
  date: Date;
}
@Injectable()
export class MessageService {
  constructor(private prisma: PrismaService) {}

  async Message(
    MessageWhereUniqueInput: Prisma.MessageWhereUniqueInput,
  ): Promise<Message | null> {
    return this.prisma.message.findUnique({
      where: MessageWhereUniqueInput,
    });
  }

  async Messages(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.MessageWhereUniqueInput;
    where?: Prisma.MessageWhereInput;
    orderBy?: Prisma.MessageOrderByWithRelationInput;
  }): Promise<Message[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.message.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async createMessage(data: Prisma.MessageCreateInput): Promise<Message> {
    return this.prisma.message.create({
      data,
    });
  }

  async updateMessage(params: {
    where: Prisma.MessageWhereUniqueInput;
    data: Prisma.MessageUpdateInput;
  }): Promise<Message> {
    const { where, data } = params;
    return this.prisma.message.update({
      data,
      where,
    });
  }

  async deleteMessage(where: Prisma.MessageWhereUniqueInput): Promise<Message> {
    return this.prisma.message.delete({
      where,
    });
  }
  async sentMessageToEventChatByEventChatId(params: ISendMessageToChatArgs) {
    const { eventChatId, message, senderName, date } = params;
    console.log(eventChatId);
    const res = this.prisma.message
      .create({
        data: {
          senderName: senderName,
          message: message,
          date: new Date(),
          EventChat: {
            connect: {
              id: eventChatId,
            },
          },
          // eventChatId: eventChatId,
        },
      })
      .catch((error) => {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          console.log(error);
          if (error.code === 'P2023') {
            throw new ForbiddenException('Invalid request');
          }
          if (error.code === 'P2025') {
            throw new ForbiddenException('EventChat not found');
          }
        }
        throw error;
      });
    return res;
  }

  async getMessagesByEventChatId(eventChatId: string) {
    return this.prisma.message
      .findMany({
        where: {
          EventChat: {
            id: eventChatId,
          },
        },
      })
      .catch((error) => {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          console.log(error);
          if (error.code === 'P2023') {
            throw new ForbiddenException('Invalid request');
          }
          if (error.code === 'P2025') {
            throw new ForbiddenException('EventChat not found');
          }
        }
        throw error;
      });
    // return this.prisma.event.findUnique({
    //   where: {
    //     id: '632206416ff5a339f41fc89d',
    //   },
    //   include: {
    //     eventChat: {
    //       include: {
    //         messages: true,
    //       },
    //     },
    //   },
    // });
  }
}
