import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class SearchExercisesInput {
  @Field({ nullable: true })
  query?: string;

  @Field({ nullable: true })
  muscleGroup?: string;

  @Field({ nullable: true })
  equipment?: string;
}
