import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class ReorderWorkoutExercisesInput {
  @Field()
  workoutId: string;

  /** Ordered list of WorkoutExercise IDs representing the desired final order. */
  @Field(() => [String])
  orderedWorkoutExerciseIds: string[];
}
