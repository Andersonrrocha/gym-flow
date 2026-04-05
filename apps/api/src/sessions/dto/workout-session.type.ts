import { Field, ID, ObjectType } from '@nestjs/graphql';
import { SessionExerciseType } from './session-exercise.type';

@ObjectType()
export class WorkoutSessionType {
  @Field(() => ID)
  id: string;

  @Field()
  userId: string;

  @Field({ nullable: true })
  workoutId?: string;

  @Field({ nullable: true })
  workoutName?: string;

  @Field()
  status: string;

  @Field(() => Date)
  startedAt: Date;

  @Field(() => Date, { nullable: true })
  finishedAt?: Date;

  @Field(() => Date)
  performedAt: Date;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field(() => [SessionExerciseType])
  sessionItems: SessionExerciseType[];
}
