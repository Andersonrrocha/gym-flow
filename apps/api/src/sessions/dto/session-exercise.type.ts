import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { ExerciseType } from '../../exercises/dto/exercise.type';
import { SessionSetType } from './session-set.type';

@ObjectType()
export class SessionExerciseType {
  @Field(() => ID)
  id: string;

  @Field()
  sessionId: string;

  @Field()
  exerciseId: string;

  @Field({ nullable: true })
  workoutExerciseId?: string;

  @Field()
  nameSnapshot: string;

  @Field(() => Int, { nullable: true })
  plannedSets?: number;

  @Field({ nullable: true })
  plannedReps?: string;

  @Field(() => Int)
  order: number;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field(() => ExerciseType)
  exercise: ExerciseType;

  @Field(() => [SessionSetType])
  sets: SessionSetType[];
}
