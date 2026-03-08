import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { SessionsResolver } from './sessions.resolver';
import { SessionsService } from './sessions.service';

@Module({
  imports: [PrismaModule],
  providers: [SessionsResolver, SessionsService],
})
export class SessionsModule {}
