import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class FinishWorkoutSessionInput {
  @Field()
  sessionId: string;
}
