import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddExerciseToWorkoutInput } from './dto/add-exercise-to-workout.input';
import { AssignWorkoutToWeekdayInput } from './dto/assign-workout-to-weekday.input';
import { CreateWorkoutInput } from './dto/create-workout.input';
import { GetWorkoutDetailsInput } from './dto/get-workout-details.input';

@Injectable()
export class WorkoutsService {
  constructor(private readonly prisma: PrismaService) {}

  async createWorkout(userId: string, input: CreateWorkoutInput) {
    return this.prisma.workout.create({
      data: {
        userId,
        name: input.name.trim(),
        description: input.description?.trim() || null,
      },
      include: {
        exercises: {
          include: {
            exercise: true,
          },
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  async listUserWorkouts(userId: string) {
    return this.prisma.workout.findMany({
      where: { userId },
      include: {
        exercises: {
          include: {
            exercise: true,
          },
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getWorkoutDetails(userId: string, input: GetWorkoutDetailsInput) {
    await this.ensureWorkoutOwnership(userId, input.workoutId);

    return this.prisma.workout.findUniqueOrThrow({
      where: { id: input.workoutId },
      include: {
        exercises: {
          include: {
            exercise: true,
          },
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  async addExerciseToWorkout(userId: string, input: AddExerciseToWorkoutInput) {
    await this.ensureWorkoutOwnership(userId, input.workoutId);

    const exerciseId = await this.resolveExerciseId(userId, input);
    const order = await this.resolveWorkoutExerciseOrder(
      input.workoutId,
      input.order,
    );

    await this.prisma.workoutExercise.create({
      data: {
        workoutId: input.workoutId,
        exerciseId,
        order,
        plannedSets: input.plannedSets ?? null,
        plannedReps: input.plannedReps?.trim() || null,
        restSeconds: input.restSeconds ?? null,
      },
    });

    return this.prisma.workout.findUniqueOrThrow({
      where: { id: input.workoutId },
      include: {
        exercises: {
          include: {
            exercise: true,
          },
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  async assignWorkoutToWeekday(
    userId: string,
    input: AssignWorkoutToWeekdayInput,
  ) {
    if (input.weekday < 0 || input.weekday > 6) {
      throw new BadRequestException('Weekday must be between 0 and 6');
    }

    await this.ensureWorkoutOwnership(userId, input.workoutId);

    return this.prisma.workoutSchedule.upsert({
      where: {
        userId_weekday: {
          userId,
          weekday: input.weekday,
        },
      },
      create: {
        userId,
        workoutId: input.workoutId,
        weekday: input.weekday,
      },
      update: {
        workoutId: input.workoutId,
      },
      include: {
        workout: {
          include: {
            exercises: {
              include: {
                exercise: true,
              },
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    });
  }

  async getWeeklyWorkoutSchedule(userId: string) {
    return this.prisma.workoutSchedule.findMany({
      where: { userId },
      include: {
        workout: {
          include: {
            exercises: {
              include: {
                exercise: true,
              },
              orderBy: { order: 'asc' },
            },
          },
        },
      },
      orderBy: { weekday: 'asc' },
    });
  }

  private async ensureWorkoutOwnership(
    userId: string,
    workoutId: string,
  ): Promise<void> {
    const workout = await this.prisma.workout.findFirst({
      where: { id: workoutId, userId },
      select: { id: true },
    });

    if (!workout) {
      throw new NotFoundException('Workout not found');
    }
  }

  private async resolveExerciseId(
    userId: string,
    input: AddExerciseToWorkoutInput,
  ): Promise<string> {
    if (input.exerciseId) {
      const exercise = await this.prisma.exercise.findFirst({
        where: {
          id: input.exerciseId,
          OR: [{ isSystem: true }, { createdByUserId: userId }],
        },
        select: { id: true },
      });

      if (!exercise) {
        throw new NotFoundException('Exercise not found');
      }

      return exercise.id;
    }

    if (!input.exerciseName?.trim()) {
      throw new BadRequestException(
        'Either exerciseId or exerciseName must be provided',
      );
    }

    const normalizedName = input.exerciseName.trim();
    const existingExercise = await this.prisma.exercise.findFirst({
      where: {
        name: { equals: normalizedName, mode: 'insensitive' },
        OR: [{ isSystem: true }, { createdByUserId: userId }],
      },
      select: { id: true },
    });

    if (existingExercise) {
      return existingExercise.id;
    }

    const createdExercise = await this.prisma.exercise.create({
      data: {
        name: normalizedName,
        muscleGroup: input.muscleGroup?.trim() || null,
        equipment: input.equipment?.trim() || null,
        isSystem: false,
        createdByUserId: userId,
      },
      select: { id: true },
    });

    return createdExercise.id;
  }

  private async resolveWorkoutExerciseOrder(
    workoutId: string,
    requestedOrder?: number,
  ): Promise<number> {
    if (requestedOrder != null) {
      return requestedOrder;
    }

    const lastExercise = await this.prisma.workoutExercise.findFirst({
      where: { workoutId },
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    return (lastExercise?.order ?? 0) + 1;
  }
}
