import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
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
