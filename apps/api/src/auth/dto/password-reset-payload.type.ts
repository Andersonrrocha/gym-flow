import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PasswordResetPayload {
  @Field()
  success: boolean;
}
