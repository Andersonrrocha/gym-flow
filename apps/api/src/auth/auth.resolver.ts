import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GqlAuthGuard } from './guards/gql-auth.guard';
import { AuthInput } from './dto/auth.input';
import { AuthResponse } from './dto/auth-response.type';
import { AuthService } from './auth.service';

type AuthenticatedRequest = {
  user: {
    userId: string;
    email: string;
  };
};

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => AuthResponse)
  register(@Args('input') input: AuthInput): Promise<AuthResponse> {
    return this.authService.register(input.email, input.password);
  }

  @Mutation(() => AuthResponse)
  login(@Args('input') input: AuthInput): Promise<AuthResponse> {
    return this.authService.login(input.email, input.password);
  }

  @Query(() => String)
  @UseGuards(GqlAuthGuard)
  protectedTest(@Context('req') req: AuthenticatedRequest): string {
    return req.user.userId;
  }
}
