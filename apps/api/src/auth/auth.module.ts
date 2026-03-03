import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';

@Module({
  imports: [PrismaModule],
  providers: [AuthResolver, AuthService],
  exports: [AuthService],
})
export class AuthModule {}
