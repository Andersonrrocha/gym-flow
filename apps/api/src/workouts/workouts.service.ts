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
import { UpdateWorkoutInput } from './dto/update-workout.input';
import { RemoveWorkoutExerciseInput } from './dto/remove-workout-exercise.input';
import { UpdateWorkoutExerciseInput } from './dto/update-workout-exercise.input';
import { ReorderWorkoutExercisesInput } from './dto/reorder-workout-exercises.input';
import { DeleteWorkoutInput } from './dto/delete-workout.input';

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

  async deleteWorkout(
    userId: string,
    input: DeleteWorkoutInput,
  ): Promise<boolean> {
    await this.ensureWorkoutOwnership(userId, input.workoutId);

    await this.prisma.workout.delete({
      where: { id: input.workoutId },
    });

    return true;
  }

  async updateWorkout(userId: string, input: UpdateWorkoutInput) {
    await this.ensureWorkoutOwnership(userId, input.workoutId);

    const data: { name?: string; description?: string | null } = {};
    if (input.name !== undefined) {
      const trimmed = input.name.trim();
      if (!trimmed) {
        throw new BadRequestException('Workout name cannot be empty');
      }
      data.name = trimmed;
    }
    if (input.description !== undefined) {
      data.description = input.description?.trim() || null;
    }

    return this.prisma.workout.update({
      where: { id: input.workoutId },
      data,
      include: {
        exercises: {
          include: { exercise: true },
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  async removeWorkoutExercise(
    userId: string,
    input: RemoveWorkoutExerciseInput,
  ) {
    const workoutExercise = await this.prisma.workoutExercise.findFirst({
      where: { id: input.workoutExerciseId },
      select: { id: true, workoutId: true },
    });

    if (!workoutExercise) {
      throw new NotFoundException('Workout exercise not found');
    }

    await this.ensureWorkoutOwnership(userId, workoutExercise.workoutId);

    await this.prisma.$transaction(async (tx) => {
      await tx.workoutExercise.delete({
        where: { id: input.workoutExerciseId },
      });

      const remaining = await tx.workoutExercise.findMany({
        where: { workoutId: workoutExercise.workoutId },
        orderBy: { order: 'asc' },
        select: { id: true },
      });

      // Two-step renumbering to avoid @@unique([workoutId, order]) conflicts
      // during recompaction after deletion.
      for (let i = 0; i < remaining.length; i++) {
        await tx.workoutExercise.update({
          where: { id: remaining[i].id },
          data: { order: -(i + 1) },
        });
      }
      for (let i = 0; i < remaining.length; i++) {
        await tx.workoutExercise.update({
          where: { id: remaining[i].id },
          data: { order: i + 1 },
        });
      }
    });

    return this.prisma.workout.findUniqueOrThrow({
      where: { id: workoutExercise.workoutId },
      include: {
        exercises: {
          include: { exercise: true },
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  async updateWorkoutExercise(
    userId: string,
    input: UpdateWorkoutExerciseInput,
  ) {
    const workoutExercise = await this.prisma.workoutExercise.findFirst({
      where: { id: input.workoutExerciseId },
      select: { id: true, workoutId: true },
    });

    if (!workoutExercise) {
      throw new NotFoundException('Workout exercise not found');
    }

    await this.ensureWorkoutOwnership(userId, workoutExercise.workoutId);

    const data: { plannedSets?: number | null; plannedReps?: string | null } =
      {};
    if (input.plannedSets !== undefined) {
      data.plannedSets = input.plannedSets ?? null;
    }
    if (input.plannedReps !== undefined) {
      data.plannedReps = input.plannedReps?.trim() || null;
    }

    await this.prisma.workoutExercise.update({
      where: { id: input.workoutExerciseId },
      data,
    });

    return this.prisma.workout.findUniqueOrThrow({
      where: { id: workoutExercise.workoutId },
      include: {
        exercises: {
          include: { exercise: true },
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  async reorderWorkoutExercises(
    userId: string,
    input: ReorderWorkoutExercisesInput,
  ) {
    await this.ensureWorkoutOwnership(userId, input.workoutId);

    const existing = await this.prisma.workoutExercise.findMany({
      where: { workoutId: input.workoutId },
      select: { id: true },
    });

    const existingIds = new Set(existing.map((e) => e.id));
    const inputIds = input.orderedWorkoutExerciseIds;

    if (
      existingIds.size !== inputIds.length ||
      !inputIds.every((id) => existingIds.has(id))
    ) {
      throw new BadRequestException(
        'orderedWorkoutExerciseIds must contain exactly the current exercises of the workout',
      );
    }

    await this.prisma.$transaction(async (tx) => {
      // Step 1: assign unique temporary orders (large negative offset) to avoid @@unique conflicts.
      for (let i = 0; i < inputIds.length; i++) {
        await tx.workoutExercise.update({
          where: { id: inputIds[i] },
          data: { order: -(i + 1) },
        });
      }
      // Step 2: assign final 1..n orders.
      for (let i = 0; i < inputIds.length; i++) {
        await tx.workoutExercise.update({
          where: { id: inputIds[i] },
          data: { order: i + 1 },
        });
      }
    });

    return this.prisma.workout.findUniqueOrThrow({
      where: { id: input.workoutId },
      include: {
        exercises: {
          include: { exercise: true },
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
        catalogKey: null,
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
