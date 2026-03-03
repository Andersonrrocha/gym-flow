import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { AuthInput } from './dto/auth.input';
import { AuthResponse } from './dto/auth-response.type';
import { AuthService } from './auth.service';

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
}
