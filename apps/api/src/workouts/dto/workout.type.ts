import { Field, ID, ObjectType } from '@nestjs/graphql';
import { WorkoutExerciseType } from './workout-exercise.type';

@ObjectType()
export class WorkoutType {
  @Field(() => ID)
  id: string;

  @Field()
  userId: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field(() => [WorkoutExerciseType])
  exercises: WorkoutExerciseType[];
}
