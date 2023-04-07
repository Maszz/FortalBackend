import {
  Field,
  Int,
  ObjectType,
  Resolver,
  Query,
  Args,
  ResolveField,
  Parent,
  Mutation,
  InputType,
  Subscription,
} from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';
import { Message } from './message.model';
import { MessageService } from './message.service';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuardGraphql } from '../auth/guard/jwt-auth-graphql.guard';
import { Prisma } from '@prisma/client';
@InputType()
export class SubscripionInput {
  @Field((type) => String, { nullable: false })
  eventChatId: string;
}
@InputType()
export class GetMessageInput {
  @Field((type) => Int, { nullable: true, defaultValue: 0 })
  offset?: number;
  @Field((type) => Int, { nullable: true, defaultValue: 20 })
  limit?: number;
  @Field((type) => String, { nullable: false })
  eventChatId: string;
}
@InputType()
export class SaveMessageInput {
  // @Field()
  //   sender_id: string;
  @Field()
  senderName: string;
  @Field()
  message: string;
  @Field((type) => String, { nullable: true })
  eventChatId: string;
}
const pubSub = new PubSub();

@Resolver((of) => Message)
export class MessageResolver {
  constructor(private readonly msgSservice: MessageService) {}

  // @UseGuards(JwtAuthGuardGraphql)
  @Query((returns) => [Message])
  async getMessage(@Args('getMessageInput') getMessageInput: GetMessageInput) {
    const data = await this.msgSservice.Messages({
      skip: getMessageInput.offset,
      take: getMessageInput.limit,
      where: {
        EventChat: {
          id: getMessageInput.eventChatId,
        },
      },
      orderBy: {
        date: 'desc',
      },
    });
    console.log(data);
    return data;
  }
  // @UseGuards(JwtAuthGuardGraphql)
  @Mutation((returns) => Message)
  async saveMessage(
    @Args('saveMessageData') saveMessageData: SaveMessageInput,
  ) {
    console.log(saveMessageData);
    const preData: Prisma.MessageCreateInput = {
      senderName: saveMessageData.senderName,
      message: saveMessageData.message,
      EventChat: {
        connect: {
          id: saveMessageData.eventChatId,
        },
      },
    };
    const data = await this.msgSservice.createMessage(preData);
    pubSub.publish(`chatMessageAsyncTrigger:${saveMessageData.eventChatId}`, {
      messageAdded: data,
    });

    return data;
  }
  //   @ResolveField()
  //   async posts(@Parent() author: Message) {
  //     const { id } = author;
  //     return this.postsService.findAll({ authorId: id });
  //   }
  // @Args('subsciptionInput') subscriptionInput: SubscripionInput
  @Subscription((returns) => Message)
  messageAdded(@Args('subsciptionInput') subscriptionInput: SubscripionInput) {
    return pubSub.asyncIterator(
      `chatMessageAsyncTrigger:${subscriptionInput.eventChatId}`,
    );
  }
}
