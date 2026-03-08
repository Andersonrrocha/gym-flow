import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { WorkoutsResolver } from './workouts.resolver';
import { WorkoutsService } from './workouts.service';

@Module({
  imports: [PrismaModule],
  providers: [WorkoutsResolver, WorkoutsService],
  exports: [WorkoutsService],
})
export class WorkoutsModule {}
