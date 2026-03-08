import { Field, Float, ID, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class SessionSetType {
  @Field(() => ID)
  id: string;

  @Field()
  sessionExerciseId: string;

  @Field(() => Int)
  reps: number;

  @Field(() => Float)
  weight: number;

  @Field(() => Int)
  setNumber: number;

  @Field(() => Date)
  createdAt: Date;
}
