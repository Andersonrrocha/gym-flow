import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class AddExerciseToWorkoutInput {
  @Field()
  workoutId: string;

  @Field({ nullable: true })
  exerciseId?: string;

  @Field({ nullable: true })
  exerciseName?: string;

  @Field({ nullable: true })
  muscleGroup?: string;

  @Field({ nullable: true })
  equipment?: string;

  @Field(() => Int, { nullable: true })
  order?: number;

  @Field(() => Int, { nullable: true })
  plannedSets?: number;

  @Field({ nullable: true })
  plannedReps?: string;

  @Field(() => Int, { nullable: true })
  restSeconds?: number;
}
