import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class RequestPasswordResetInput {
  @Field()
  email: string;

  /** BCP 47 / app locale segment for the reset URL (e.g. pt, en). */
  @Field(() => String, { nullable: true })
  locale?: string | null;
}
