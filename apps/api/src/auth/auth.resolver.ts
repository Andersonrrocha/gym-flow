import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import type { Response } from 'express';
import { GqlAuthGuard } from './guards/gql-auth.guard';
import { AuthInput } from './dto/auth.input';
import { AuthResponse } from './dto/auth-response.type';
import { AuthService } from './auth.service';

const ACCESS_TOKEN_COOKIE = 'gymflow_access_token';
const REFRESH_TOKEN_COOKIE = 'gymflow_refresh_token';
const COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

type AuthenticatedRequest = {
  user: {
    userId: string;
    email: string;
  };
};

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  private setAuthCookies(
    res: Response,
    accessToken: string,
    refreshToken: string,
  ): void {
    const isProduction = process.env.NODE_ENV === 'production';

    res.cookie(ACCESS_TOKEN_COOKIE, accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: COOKIE_MAX_AGE_MS,
    });

    res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: COOKIE_MAX_AGE_MS,
    });
  }

  private clearAuthCookies(res: Response): void {
    const isProduction = process.env.NODE_ENV === 'production';

    res.clearCookie(ACCESS_TOKEN_COOKIE, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
    });

    res.clearCookie(REFRESH_TOKEN_COOKIE, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
    });
  }

  @Mutation(() => AuthResponse)
  async register(
    @Args('input') input: AuthInput,
    @Context('res') res: Response,
  ): Promise<AuthResponse> {
    const tokens = await this.authService.register(input.email, input.password);
    this.setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
    return { success: true };
  }

  @Mutation(() => AuthResponse)
  async login(
    @Args('input') input: AuthInput,
    @Context('res') res: Response,
  ): Promise<AuthResponse> {
    const tokens = await this.authService.login(input.email, input.password);
    this.setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
    return { success: true };
  }

  @Mutation(() => Boolean)
  logout(@Context('res') res: Response): boolean {
    this.clearAuthCookies(res);
    return true;
  }

  @Query(() => String)
  @UseGuards(GqlAuthGuard)
  protectedTest(@Context('req') req: AuthenticatedRequest): string {
    return req.user.userId;
  }
}
