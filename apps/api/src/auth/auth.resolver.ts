import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import type { Request, Response } from 'express';
import { GqlAuthGuard } from './guards/gql-auth.guard';
import { AuthInput } from './dto/auth.input';
import { AuthResponse } from './dto/auth-response.type';
import { AuthService } from './auth.service';

const ACCESS_TOKEN_COOKIE = 'gymflow_access_token';
const REFRESH_TOKEN_COOKIE = 'gymflow_refresh_token';

/** Access token cookie lifetime — aligned with the JWT expiresIn of 15 minutes. */
const ACCESS_COOKIE_MAX_AGE_MS = 15 * 60 * 1000;
/** Refresh token cookie lifetime — aligned with the refresh JWT expiresIn of 7 days. */
const REFRESH_COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

type AuthenticatedRequest = Request & {
  user: {
    userId: string;
    email: string;
  };
};

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  private get isProduction(): boolean {
    return process.env.NODE_ENV === 'production';
  }

  private setAccessCookie(res: Response, accessToken: string): void {
    res.cookie(ACCESS_TOKEN_COOKIE, accessToken, {
      httpOnly: true,
      secure: this.isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: ACCESS_COOKIE_MAX_AGE_MS,
    });
  }

  private setAuthCookies(
    res: Response,
    accessToken: string,
    refreshToken: string,
  ): void {
    this.setAccessCookie(res, accessToken);
    res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
      httpOnly: true,
      secure: this.isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: REFRESH_COOKIE_MAX_AGE_MS,
    });
  }

  private clearAuthCookies(res: Response): void {
    res.clearCookie(ACCESS_TOKEN_COOKIE, {
      httpOnly: true,
      secure: this.isProduction,
      sameSite: 'lax',
      path: '/',
    });
    res.clearCookie(REFRESH_TOKEN_COOKIE, {
      httpOnly: true,
      secure: this.isProduction,
      sameSite: 'lax',
      path: '/',
    });
  }

  private extractRefreshTokenFromCookie(req: Request): string {
    const cookieHeader = req.headers.cookie ?? '';
    const match = cookieHeader
      .split(';')
      .map((c) => c.trim())
      .find((c) => c.startsWith(`${REFRESH_TOKEN_COOKIE}=`));
    if (!match) return '';
    return decodeURIComponent(match.split('=')[1] ?? '');
  }

  @Mutation(() => AuthResponse)
  async register(
    @Args('input') input: AuthInput,
    @Context('res') res: Response,
  ): Promise<AuthResponse> {
    const tokens = await this.authService.register(input.email, input.password);
    this.setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
    return { success: true, accessToken: tokens.accessToken };
  }

  @Mutation(() => AuthResponse)
  async login(
    @Args('input') input: AuthInput,
    @Context('res') res: Response,
  ): Promise<AuthResponse> {
    const tokens = await this.authService.login(input.email, input.password);
    this.setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
    return { success: true, accessToken: tokens.accessToken };
  }

  /**
   * Refresh session: public mutation (no auth guard).
   * Reads gymflow_refresh_token from httpOnly cookie, validates it, and issues a new access token.
   * Refresh token is NOT rotated in this milestone.
   */
  @Mutation(() => AuthResponse)
  async refreshSession(
    @Context('req') req: Request,
    @Context('res') res: Response,
  ): Promise<AuthResponse> {
    const refreshTokenRaw = this.extractRefreshTokenFromCookie(req);
    const { accessToken } =
      await this.authService.refreshAccessToken(refreshTokenRaw);
    // Re-set the access token cookie with the correct short lifetime.
    this.setAccessCookie(res, accessToken);
    return { success: true, accessToken };
  }

  /**
   * Voluntary logout: requires authentication to identify the user and invalidate
   * the refresh token hash in the database before clearing cookies.
   */
  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async logout(
    @Context('req') req: AuthenticatedRequest,
    @Context('res') res: Response,
  ): Promise<boolean> {
    await this.authService.invalidateRefreshToken(req.user.userId);
    this.clearAuthCookies(res);
    return true;
  }

  @Query(() => String)
  @UseGuards(GqlAuthGuard)
  protectedTest(@Context('req') req: AuthenticatedRequest): string {
    return req.user.userId;
  }
}
