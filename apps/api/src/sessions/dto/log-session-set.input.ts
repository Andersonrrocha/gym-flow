import { Field, Float, InputType, Int } from '@nestjs/graphql';

@InputType()
export class LogSessionSetInput {
  @Field()
  sessionExerciseId: string;

  @Field(() => Int)
  reps: number;

  @Field(() => Float)
  weight: number;

  @Field(() => Int, { nullable: true })
  setNumber?: number;
}
