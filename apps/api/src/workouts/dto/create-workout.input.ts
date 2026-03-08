import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateWorkoutInput {
  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;
}
