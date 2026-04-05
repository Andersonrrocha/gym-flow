import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class UpdateWorkoutExerciseInput {
  @Field()
  workoutExerciseId: string;

  @Field(() => Int, { nullable: true })
  plannedSets?: number;

  @Field({ nullable: true })
  plannedReps?: string;
}
