import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { WorkoutType } from './workout.type';

@ObjectType()
export class WorkoutScheduleType {
  @Field(() => ID)
  id: string;

  @Field()
  userId: string;

  @Field()
  workoutId: string;

  @Field(() => Int)
  weekday: number;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field(() => WorkoutType)
  workout: WorkoutType;
}
