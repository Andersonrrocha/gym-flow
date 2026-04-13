import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { createHash, randomBytes } from 'node:crypto';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';

const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000;

const HAS_UPPERCASE = /[A-Z]/;
const HAS_LOWERCASE = /[a-z]/;
const HAS_NUMBER = /\d/;
const HAS_SPECIAL = /[^A-Za-z0-9]/;

type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  async register(email: string, password: string): Promise<AuthTokens> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        email,
        password: passwordHash,
      },
    });

    const tokens = await this.generateTokens(user.id, user.email);
    await this.storeRefreshTokenHash(user.id, tokens.refreshToken);

    return tokens;
  }

  async login(email: string, password: string): Promise<AuthTokens> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('Account not found');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Incorrect password');
    }

    const tokens = await this.generateTokens(user.id, user.email);
    await this.storeRefreshTokenHash(user.id, tokens.refreshToken);

    return tokens;
  }

  /**
   * Validates the raw refresh JWT against the stored hash and issues a new access token.
   * Refresh token itself is NOT rotated in this milestone (stable until 7d expiry).
   */
  async refreshAccessToken(
    refreshTokenRaw: string,
  ): Promise<{ accessToken: string }> {
    if (!refreshTokenRaw) {
      throw new UnauthorizedException('Refresh token is required');
    }

    const refreshSecret = process.env.JWT_REFRESH_SECRET;
    if (!refreshSecret) {
      throw new Error('JWT_REFRESH_SECRET is not defined');
    }

    let payload: { sub: string; email: string };
    try {
      payload = await this.jwtService.verifyAsync<{
        sub: string;
        email: string;
      }>(refreshTokenRaw, { secret: refreshSecret });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Session not found');
    }

    const isHashValid = await bcrypt.compare(
      refreshTokenRaw,
      user.refreshToken,
    );
    if (!isHashValid) {
      throw new UnauthorizedException('Refresh token mismatch');
    }

    const accessToken = await this.jwtService.signAsync(
      { sub: payload.sub, email: payload.email },
      { expiresIn: '15m' },
    );

    return { accessToken };
  }

  /**
   * Invalidates the refresh token hash in the database.
   * Called on voluntary logout (with known userId from auth context).
   */
  async invalidateRefreshToken(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
  }

  /**
   * Creates a one-hour reset token and emails a link (or logs it in development without SMTP).
   * Always appears to succeed from the client to avoid email enumeration.
   */
  async requestPasswordReset(
    emailRaw: string,
    localeHint?: string | null,
  ): Promise<void> {
    const email = emailRaw.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      return;
    }

    await this.prisma.passwordResetToken.deleteMany({
      where: { userId: user.id },
    });

    const rawToken = randomBytes(32).toString('hex');
    const tokenHash = this.hashResetToken(rawToken);
    const expiresAt = new Date(Date.now() + PASSWORD_RESET_TTL_MS);

    await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    const baseUrl = (process.env.WEB_URL ?? 'http://localhost:3000').replace(
      /\/$/,
      '',
    );
    const envDefault = process.env.PASSWORD_RESET_EMAIL_LOCALE ?? 'en';
    const segment =
      localeHint === 'pt' || localeHint === 'en' ? localeHint : envDefault;
    const resetUrl = `${baseUrl}/${segment}/reset-password?token=${encodeURIComponent(rawToken)}`;

    const emailLocale = segment === 'pt' ? 'pt' : 'en';
    await this.mailService.sendPasswordResetEmail(
      user.email,
      resetUrl,
      emailLocale,
    );
  }

  async resetPassword(rawToken: string, newPassword: string): Promise<void> {
    this.assertStrongPassword(newPassword);

    const tokenHash = this.hashResetToken(rawToken.trim());
    const record = await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!record || record.expiresAt.getTime() <= Date.now()) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: record.userId },
        data: {
          password: passwordHash,
          refreshToken: null,
        },
      }),
      this.prisma.passwordResetToken.delete({ where: { id: record.id } }),
    ]);
  }

  private hashResetToken(raw: string): string {
    return createHash('sha256').update(raw).digest('hex');
  }

  private assertStrongPassword(password: string): void {
    if (
      !HAS_UPPERCASE.test(password) ||
      !HAS_LOWERCASE.test(password) ||
      !HAS_NUMBER.test(password) ||
      !HAS_SPECIAL.test(password)
    ) {
      throw new BadRequestException('Password does not meet complexity rules');
    }
  }

  private async generateTokens(
    userId: string,
    email: string,
  ): Promise<AuthTokens> {
    const refreshSecret = process.env.JWT_REFRESH_SECRET;

    if (!refreshSecret) {
      throw new Error('JWT_REFRESH_SECRET is not defined');
    }

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, email },
        {
          expiresIn: '15m',
        },
      ),
      this.jwtService.signAsync(
        { sub: userId, email },
        {
          secret: refreshSecret,
          expiresIn: '7d',
        },
      ),
    ]);

    return { accessToken, refreshToken };
  }

  private async storeRefreshTokenHash(
    userId: string,
    refreshToken: string,
  ): Promise<void> {
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        refreshToken: refreshTokenHash,
      },
    });
  }
}
