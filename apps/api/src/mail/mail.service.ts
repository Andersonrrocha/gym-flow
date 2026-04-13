import { Injectable, Logger } from '@nestjs/common';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Resend } from 'resend';

export type PasswordResetEmailLocale = 'pt' | 'en';

const DEFAULT_MAIL_FROM = 'GymFlow <onboarding@resend.dev>';

/** Strip outer quotes often stored literally in host env UIs. */
function stripSurroundingQuotes(raw: string): string {
  let s = raw.trim();
  if (
    (s.startsWith('"') && s.endsWith('"')) ||
    (s.startsWith("'") && s.endsWith("'"))
  ) {
    s = s.slice(1, -1).trim();
  }
  return s;
}

/**
 * Resend requires `from` like `a@b.co` or `Name <a@b.co>`.
 * Empty MAIL_FROM must fall back (empty string is not nullish for ??).
 */
function isPlausibleResendFrom(value: string): boolean {
  const v = value.trim();
  if (!v) return false;
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return true;
  return /^[\s\S]+<\s*[^\s@]+@[^\s@]+\.[^\s@]+\s*>$/.test(v);
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private resend: Resend | null = null;

  private resolveFromAddress(): string {
    const rawEnv = process.env.MAIL_FROM;
    const stripped = rawEnv !== undefined ? stripSurroundingQuotes(rawEnv) : '';
    if (stripped && isPlausibleResendFrom(stripped)) {
      return stripped;
    }
    if (stripped.length > 0) {
      this.logger.warn(
        'MAIL_FROM is invalid for Resend; using default onboarding sender',
      );
    }
    return DEFAULT_MAIL_FROM;
  }

  private getResend(): Resend | null {
    const key = process.env.RESEND_API_KEY?.trim();
    if (!key) {
      return null;
    }
    if (!this.resend) {
      this.resend = new Resend(key);
    }
    return this.resend;
  }

  private resolveLogoUrl(): string {
    const explicit = process.env.EMAIL_LOGO_URL?.trim();
    if (explicit) {
      return explicit;
    }
    const base = (process.env.WEB_URL ?? 'http://localhost:3000').replace(
      /\/$/,
      '',
    );
    return `${base}/logo.png`;
  }

  private renderPasswordResetHtml(
    locale: PasswordResetEmailLocale,
    resetUrl: string,
  ): string {
    const safeLocale = locale === 'pt' ? 'pt' : 'en';
    const templatePath = join(
      __dirname,
      'templates',
      `password-reset.${safeLocale}.html`,
    );
    let raw: string;
    try {
      raw = readFileSync(templatePath, 'utf-8');
    } catch {
      const fallback = join(__dirname, 'templates', 'password-reset.en.html');
      raw = readFileSync(fallback, 'utf-8');
    }
    const logoUrl = this.resolveLogoUrl();
    return raw
      .replaceAll('{{ logo_url }}', logoUrl)
      .replaceAll('{{ reset_url }}', resetUrl);
  }

  private passwordResetPlainText(
    locale: PasswordResetEmailLocale,
    resetUrl: string,
  ): string {
    if (locale === 'pt') {
      return [
        'Abra o link abaixo para redefinir a sua senha (expira em 1 hora):',
        '',
        resetUrl,
        '',
        'Se não pediu este email, pode ignorá-lo.',
      ].join('\n');
    }
    return [
      'Open the link below to reset your password (expires in 1 hour):',
      '',
      resetUrl,
      '',
      'If you did not request this email, you can ignore it.',
    ].join('\n');
  }

  private passwordResetSubject(locale: PasswordResetEmailLocale): string {
    return locale === 'pt'
      ? 'Redefinir a sua senha GymFlow'
      : 'Reset your GymFlow password';
  }

  /**
   * @param locale - Must match the locale segment in the reset URL (pt/en).
   */
  async sendPasswordResetEmail(
    to: string,
    resetUrl: string,
    locale: PasswordResetEmailLocale = 'en',
  ): Promise<void> {
    const client = this.getResend();
    const from = this.resolveFromAddress();

    const mailLocale: PasswordResetEmailLocale = locale === 'pt' ? 'pt' : 'en';
    const html = this.renderPasswordResetHtml(mailLocale, resetUrl);
    const text = this.passwordResetPlainText(mailLocale, resetUrl);
    const subject = this.passwordResetSubject(mailLocale);

    if (client) {
      const { error } = await client.emails.send({
        from,
        to,
        subject,
        text,
        html,
      });

      if (error) {
        this.logger.error(`Resend: ${error.message}`);
        throw new Error(
          `Failed to send password reset email: ${error.message}`,
        );
      }
      return;
    }

    if (process.env.NODE_ENV !== 'production') {
      this.logger.warn(
        `[dev] Password reset (${mailLocale}) for ${to}: ${resetUrl}`,
      );
      return;
    }

    this.logger.error(
      'RESEND_API_KEY is not set; password reset email was not sent',
    );
  }
}
