import { UseGuards } from '@nestjs/common';
import { Args, Context, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { AddExerciseToSessionInput } from './dto/add-exercise-to-session.input';
import { FinishWorkoutSessionInput } from './dto/finish-workout-session.input';
import { LogSessionSetInput } from './dto/log-session-set.input';
import { SessionSetType } from './dto/session-set.type';
import { StartWorkoutSessionInput } from './dto/start-workout-session.input';
import { WorkoutSessionType } from './dto/workout-session.type';
import { SessionsService } from './sessions.service';

type AuthenticatedRequest = {
  user: {
    userId: string;
    email: string;
  };
};

@Resolver(() => WorkoutSessionType)
@UseGuards(GqlAuthGuard)
export class SessionsResolver {
  constructor(private readonly sessionsService: SessionsService) {}

  @Query(() => [WorkoutSessionType])
  listUserSessions(
    @Context('req') req: AuthenticatedRequest,
    @Args('status', { nullable: true, type: () => String }) status?: string,
  ) {
    const allowed = ['IN_PROGRESS', 'COMPLETED', 'CANCELLED'] as const;
    const normalized = allowed.find((s) => s === status);
    return this.sessionsService.listUserSessions(req.user.userId, normalized);
  }

  @Query(() => WorkoutSessionType, { nullable: true })
  workoutSession(
    @Context('req') req: AuthenticatedRequest,
    @Args('id', { type: () => ID }) id: string,
  ) {
    return this.sessionsService.getWorkoutSessionForUser(req.user.userId, id);
  }

  @Mutation(() => WorkoutSessionType)
  startSessionFromWorkout(
    @Context('req') req: AuthenticatedRequest,
    @Args('input') input: StartWorkoutSessionInput,
  ) {
    return this.sessionsService.startSessionFromWorkout(req.user.userId, input);
  }

  @Mutation(() => WorkoutSessionType)
  addExerciseDuringSession(
    @Context('req') req: AuthenticatedRequest,
    @Args('input') input: AddExerciseToSessionInput,
  ) {
    return this.sessionsService.addExerciseDuringSession(
      req.user.userId,
      input,
    );
  }

  @Mutation(() => SessionSetType)
  logSessionSet(
    @Context('req') req: AuthenticatedRequest,
    @Args('input') input: LogSessionSetInput,
  ) {
    return this.sessionsService.logSessionSet(req.user.userId, input);
  }

  @Mutation(() => WorkoutSessionType)
  finishWorkoutSession(
    @Context('req') req: AuthenticatedRequest,
    @Args('input') input: FinishWorkoutSessionInput,
  ) {
    return this.sessionsService.finishWorkoutSession(req.user.userId, input);
  }
}
