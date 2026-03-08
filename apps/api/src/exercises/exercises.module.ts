import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ExercisesResolver } from './exercises.resolver';
import { ExercisesService } from './exercises.service';

@Module({
  imports: [PrismaModule],
  providers: [ExercisesResolver, ExercisesService],
  exports: [ExercisesService],
})
export class ExercisesModule {}
