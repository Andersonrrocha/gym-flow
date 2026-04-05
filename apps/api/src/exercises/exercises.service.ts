import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExerciseInput } from './dto/create-exercise.input';
import { SearchExercisesInput } from './dto/search-exercises.input';

@Injectable()
export class ExercisesService {
  constructor(private readonly prisma: PrismaService) {}

  async searchExercises(userId: string, input?: SearchExercisesInput) {
    const andParts: Prisma.ExerciseWhereInput[] = [
      { OR: [{ isSystem: true }, { createdByUserId: userId }] },
    ];

    if (input?.query?.trim()) {
      andParts.push({
        name: { contains: input.query.trim(), mode: 'insensitive' },
      });
    }

    if (input?.muscleGroup?.trim()) {
      andParts.push({
        muscleGroup: {
          equals: input.muscleGroup.trim(),
          mode: 'insensitive',
        },
      });
    }

    if (input?.equipment?.trim()) {
      andParts.push({
        equipment: {
          equals: input.equipment.trim(),
          mode: 'insensitive',
        },
      });
    }

    return this.prisma.exercise.findMany({
      where: { AND: andParts },
      orderBy: [{ isSystem: 'desc' }, { name: 'asc' }],
    });
  }

  async createExercise(userId: string, input: CreateExerciseInput) {
    return this.prisma.exercise.create({
      data: {
        name: input.name.trim(),
        catalogKey: null,
        muscleGroup: input.muscleGroup?.trim() || null,
        equipment: input.equipment?.trim() || null,
        isSystem: false,
        createdByUserId: userId,
      },
    });
  }
}
