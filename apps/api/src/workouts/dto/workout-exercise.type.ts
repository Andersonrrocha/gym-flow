import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { ExerciseType } from '../../exercises/dto/exercise.type';

@ObjectType()
export class WorkoutExerciseType {
  @Field(() => ID)
  id: string;

  @Field()
  workoutId: string;

  @Field()
  exerciseId: string;

  @Field(() => Int)
  order: number;

  @Field(() => Int, { nullable: true })
  plannedSets?: number;

  @Field({ nullable: true })
  plannedReps?: string;

  @Field(() => Int, { nullable: true })
  restSeconds?: number;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field(() => ExerciseType)
  exercise: ExerciseType;
}
