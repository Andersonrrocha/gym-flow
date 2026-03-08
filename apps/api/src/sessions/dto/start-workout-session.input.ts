import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class StartWorkoutSessionInput {
  @Field()
  workoutId: string;
}
