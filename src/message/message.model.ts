import { Field, Int, ObjectType, ID } from '@nestjs/graphql';

@ObjectType()
export class Message {
  @Field((type) => ID)
  id: string;

  @Field((type) => String, { nullable: true })
  sender_id?: number;

  @Field((type) => String, { nullable: true })
  senderName?: string;

  @Field((type) => String, { nullable: true })
  message: string;

  @Field((type) => Date)
  date: Date;
}
