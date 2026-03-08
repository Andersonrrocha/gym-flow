import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class GetWorkoutDetailsInput {
  @Field()
  workoutId: string;
}
