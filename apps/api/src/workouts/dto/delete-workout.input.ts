import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class DeleteWorkoutInput {
  @Field()
  workoutId: string;
}
