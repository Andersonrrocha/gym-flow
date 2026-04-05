import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ExerciseType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  catalogKey?: string;

  @Field({ nullable: true })
  muscleGroup?: string;

  @Field({ nullable: true })
  equipment?: string;

  @Field()
  isSystem: boolean;

  @Field({ nullable: true })
  createdByUserId?: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}
