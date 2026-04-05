import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class UpdateWorkoutInput {
  @Field()
  workoutId: string;

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  description?: string;
}
