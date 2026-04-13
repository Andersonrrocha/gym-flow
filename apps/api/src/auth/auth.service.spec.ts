import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { MailService } from '../mail/mail.service';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: { verifyAsync: jest.Mock; signAsync: jest.Mock };
  let prisma: { user: { findUnique: jest.Mock } };

  beforeEach(async () => {
    process.env.JWT_REFRESH_SECRET =
      process.env.JWT_REFRESH_SECRET ?? 'test-refresh-secret';
    jwtService = {
      verifyAsync: jest.fn(),
      signAsync: jest.fn(),
    };
    prisma = {
      user: { findUnique: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwtService },
        {
          provide: MailService,
          useValue: { sendPasswordResetEmail: jest.fn() },
        },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  describe('refreshAccessToken', () => {
    it('throws when refresh token is empty', async () => {
      await expect(service.refreshAccessToken('')).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });

    it('throws when JWT verify fails', async () => {
      jwtService.verifyAsync.mockRejectedValue(new Error('invalid'));

      await expect(
        service.refreshAccessToken('bad.jwt.here'),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('throws when user has no stored refresh hash', async () => {
      jwtService.verifyAsync.mockResolvedValue({ sub: 'u1', email: 'a@b.com' });
      prisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        refreshToken: null,
      });

      await expect(
        service.refreshAccessToken('valid.jwt'),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });
});
