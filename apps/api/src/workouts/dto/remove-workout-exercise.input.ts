import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class RemoveWorkoutExerciseInput {
  @Field()
  workoutExerciseId: string;
}
