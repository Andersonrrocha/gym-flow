import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExerciseInput } from './dto/create-exercise.input';
import { SearchExercisesInput } from './dto/search-exercises.input';

@Injectable()
export class ExercisesService {
  constructor(private readonly prisma: PrismaService) {}

  async searchExercises(userId: string, input?: SearchExercisesInput) {
    const where: Prisma.ExerciseWhereInput = {
      OR: [{ isSystem: true }, { createdByUserId: userId }],
    };

    if (input?.query) {
      where.name = { contains: input.query, mode: 'insensitive' };
    }

    if (input?.muscleGroup) {
      where.muscleGroup = input.muscleGroup;
    }

    if (input?.equipment) {
      where.equipment = input.equipment;
    }

    return this.prisma.exercise.findMany({
      where,
      orderBy: [{ isSystem: 'desc' }, { name: 'asc' }],
    });
  }

  async createExercise(userId: string, input: CreateExerciseInput) {
    return this.prisma.exercise.create({
      data: {
        name: input.name.trim(),
        muscleGroup: input.muscleGroup?.trim() || null,
        equipment: input.equipment?.trim() || null,
        isSystem: false,
        createdByUserId: userId,
      },
    });
  }
}
