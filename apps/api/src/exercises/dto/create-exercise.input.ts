import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateExerciseInput {
  @Field()
  name: string;

  @Field({ nullable: true })
  muscleGroup?: string;

  @Field({ nullable: true })
  equipment?: string;
}
