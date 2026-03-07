import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';

type JwtPayload = {
  sub: string;
  email: string;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined');
    }

    const extractJwtFromCookie = (req: Request): string | null => {
      const cookieHeader = req?.headers?.cookie;
      if (!cookieHeader) return null;

      const match = cookieHeader
        .split(';')
        .map((cookie) => cookie.trim())
        .find((cookie) => cookie.startsWith('gymflow_access_token='));

      if (!match) return null;
      return decodeURIComponent(match.split('=')[1] ?? '');
    };

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        extractJwtFromCookie,
      ]),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  validate(payload: JwtPayload) {
    if (!payload?.sub || !payload?.email) {
      throw new UnauthorizedException('Invalid access token payload');
    }

    return { userId: payload.sub, email: payload.email };
  }
}
