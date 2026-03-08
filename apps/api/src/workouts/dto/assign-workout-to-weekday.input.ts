import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class AssignWorkoutToWeekdayInput {
  @Field()
  workoutId: string;

  @Field(() => Int)
  weekday: number;
}
