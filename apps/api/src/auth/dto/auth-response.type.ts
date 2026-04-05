import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class AuthResponse {
  @Field()
  success: boolean;

  /** Same JWT as Set-Cookie; lets SPA send Authorization when API runs on another origin. */
  @Field({ nullable: true })
  accessToken?: string;
}
