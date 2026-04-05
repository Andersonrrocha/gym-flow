import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddExerciseToSessionInput } from './dto/add-exercise-to-session.input';
import { FinishWorkoutSessionInput } from './dto/finish-workout-session.input';
import { LogSessionSetInput } from './dto/log-session-set.input';
import { StartWorkoutSessionInput } from './dto/start-workout-session.input';

@Injectable()
export class SessionsService {
  constructor(private readonly prisma: PrismaService) {}

  async startSessionFromWorkout(
    userId: string,
    input: StartWorkoutSessionInput,
  ) {
    const workout = await this.prisma.workout.findFirst({
      where: { id: input.workoutId, userId },
      include: {
        exercises: {
          include: { exercise: true },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!workout) {
      throw new NotFoundException('Workout not found');
    }

    const session = await this.prisma.workoutSession.create({
      data: {
        userId,
        workoutId: workout.id,
      },
    });

    if (workout.exercises.length > 0) {
      await this.prisma.sessionExercise.createMany({
        data: workout.exercises.map((item) => ({
          sessionId: session.id,
          exerciseId: item.exerciseId,
          workoutExerciseId: item.id,
          nameSnapshot: item.exercise.name,
          plannedSets: item.plannedSets,
          plannedReps: item.plannedReps,
          order: item.order,
        })),
      });
    }

    return this.getSessionDetails(userId, session.id);
  }

  async addExerciseDuringSession(
    userId: string,
    input: AddExerciseToSessionInput,
  ) {
    const session = await this.ensureActiveSessionOwnership(
      userId,
      input.sessionId,
    );
    const exercise = await this.resolveExercise(userId, input);
    const order = await this.resolveSessionExerciseOrder(
      session.id,
      input.order,
    );

    await this.prisma.sessionExercise.create({
      data: {
        sessionId: session.id,
        exerciseId: exercise.id,
        workoutExerciseId: null,
        nameSnapshot: exercise.name,
        plannedSets: input.plannedSets ?? null,
        plannedReps: input.plannedReps?.trim() || null,
        order,
      },
    });

    return this.getSessionDetails(userId, session.id);
  }

  async logSessionSet(userId: string, input: LogSessionSetInput) {
    const sessionExercise = await this.prisma.sessionExercise.findFirst({
      where: {
        id: input.sessionExerciseId,
        session: { userId },
      },
      include: {
        session: {
          select: { id: true, status: true },
        },
      },
    });

    if (!sessionExercise) {
      throw new NotFoundException('Session exercise not found');
    }

    if (sessionExercise.session.status !== 'IN_PROGRESS') {
      throw new BadRequestException('Workout session is not active');
    }

    const setNumber =
      input.setNumber ?? (await this.resolveNextSetNumber(sessionExercise.id));

    return this.prisma.sessionSet.create({
      data: {
        sessionExerciseId: sessionExercise.id,
        reps: input.reps,
        weight: input.weight,
        setNumber,
      },
    });
  }

  async finishWorkoutSession(userId: string, input: FinishWorkoutSessionInput) {
    const session = await this.prisma.workoutSession.findFirst({
      where: {
        id: input.sessionId,
        userId,
      },
      select: { id: true, status: true },
    });

    if (!session) {
      throw new NotFoundException('Workout session not found');
    }

    if (session.status !== 'IN_PROGRESS') {
      throw new BadRequestException('Workout session is not active');
    }

    await this.prisma.workoutSession.update({
      where: { id: session.id },
      data: {
        status: 'COMPLETED',
        finishedAt: new Date(),
      },
    });

    return this.getSessionDetails(userId, session.id);
  }

  async getWorkoutSessionForUser(userId: string, sessionId: string) {
    const session = await this.prisma.workoutSession.findFirst({
      where: { id: sessionId, userId },
      include: {
        workout: { select: { name: true } },
        sessionItems: {
          include: {
            exercise: true,
            sets: { orderBy: { setNumber: 'asc' } },
          },
          orderBy: { order: 'asc' },
        },
      },
    });
    if (!session) {
      return null;
    }
    const { workout, ...rest } = session;
    return {
      ...rest,
      workoutName: workout?.name ?? null,
    };
  }

  async listUserSessions(
    userId: string,
    status?: 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED',
  ) {
    const rows = await this.prisma.workoutSession.findMany({
      where: {
        userId,
        ...(status ? { status } : {}),
      },
      orderBy: { startedAt: 'desc' },
      take: 100,
      include: {
        workout: { select: { name: true } },
        sessionItems: {
          include: {
            exercise: true,
            sets: { orderBy: { setNumber: 'asc' } },
          },
          orderBy: { order: 'asc' },
        },
      },
    });
    return rows.map((s) => {
      const { workout, ...rest } = s;
      return {
        ...rest,
        workoutName: workout?.name ?? null,
      };
    });
  }

  private async getSessionDetails(userId: string, sessionId: string) {
    const session = await this.prisma.workoutSession.findFirst({
      where: { id: sessionId, userId },
      include: {
        workout: { select: { name: true } },
        sessionItems: {
          include: {
            exercise: true,
            sets: { orderBy: { setNumber: 'asc' } },
          },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!session) {
      throw new NotFoundException('Workout session not found');
    }

    const { workout, ...rest } = session;
    return {
      ...rest,
      workoutName: workout?.name ?? null,
    };
  }

  private async ensureActiveSessionOwnership(
    userId: string,
    sessionId: string,
  ) {
    const session = await this.prisma.workoutSession.findFirst({
      where: { id: sessionId, userId },
      select: { id: true, status: true },
    });

    if (!session) {
      throw new NotFoundException('Workout session not found');
    }

    if (session.status !== 'IN_PROGRESS') {
      throw new BadRequestException('Workout session is not active');
    }

    return session;
  }

  private async resolveExercise(
    userId: string,
    input: AddExerciseToSessionInput,
  ) {
    if (input.exerciseId) {
      const exercise = await this.prisma.exercise.findFirst({
        where: {
          id: input.exerciseId,
          OR: [{ isSystem: true }, { createdByUserId: userId }],
        },
      });

      if (!exercise) {
        throw new NotFoundException('Exercise not found');
      }

      return exercise;
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
    });

    if (existingExercise) {
      return existingExercise;
    }

    return this.prisma.exercise.create({
      data: {
        name: normalizedName,
        catalogKey: null,
        muscleGroup: input.muscleGroup?.trim() || null,
        equipment: input.equipment?.trim() || null,
        isSystem: false,
        createdByUserId: userId,
      },
    });
  }

  private async resolveSessionExerciseOrder(
    sessionId: string,
    requestedOrder?: number,
  ): Promise<number> {
    if (requestedOrder != null) {
      return requestedOrder;
    }

    const lastExercise = await this.prisma.sessionExercise.findFirst({
      where: { sessionId },
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    return (lastExercise?.order ?? 0) + 1;
  }

  private async resolveNextSetNumber(
    sessionExerciseId: string,
  ): Promise<number> {
    const lastSet = await this.prisma.sessionSet.findFirst({
      where: { sessionExerciseId },
      orderBy: { setNumber: 'desc' },
      select: { setNumber: true },
    });

    return (lastSet?.setNumber ?? 0) + 1;
  }
}
