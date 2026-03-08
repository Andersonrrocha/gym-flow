import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { AddExerciseToWorkoutInput } from './dto/add-exercise-to-workout.input';
import { AssignWorkoutToWeekdayInput } from './dto/assign-workout-to-weekday.input';
import { CreateWorkoutInput } from './dto/create-workout.input';
import { GetWorkoutDetailsInput } from './dto/get-workout-details.input';
import { WorkoutScheduleType } from './dto/workout-schedule.type';
import { WorkoutType } from './dto/workout.type';
import { WorkoutsService } from './workouts.service';

type AuthenticatedRequest = {
  user: {
    userId: string;
    email: string;
  };
};

@Resolver(() => WorkoutType)
@UseGuards(GqlAuthGuard)
export class WorkoutsResolver {
  constructor(private readonly workoutsService: WorkoutsService) {}

  @Mutation(() => WorkoutType)
  createWorkout(
    @Context('req') req: AuthenticatedRequest,
    @Args('input') input: CreateWorkoutInput,
  ) {
    return this.workoutsService.createWorkout(req.user.userId, input);
  }

  @Query(() => [WorkoutType])
  listUserWorkouts(@Context('req') req: AuthenticatedRequest) {
    return this.workoutsService.listUserWorkouts(req.user.userId);
  }

  @Mutation(() => WorkoutType)
  addExerciseToWorkout(
    @Context('req') req: AuthenticatedRequest,
    @Args('input') input: AddExerciseToWorkoutInput,
  ) {
    return this.workoutsService.addExerciseToWorkout(req.user.userId, input);
  }

  @Query(() => WorkoutType)
  getWorkoutDetails(
    @Context('req') req: AuthenticatedRequest,
    @Args('input') input: GetWorkoutDetailsInput,
  ) {
    return this.workoutsService.getWorkoutDetails(req.user.userId, input);
  }

  @Mutation(() => WorkoutScheduleType)
  assignWorkoutToWeekday(
    @Context('req') req: AuthenticatedRequest,
    @Args('input') input: AssignWorkoutToWeekdayInput,
  ) {
    return this.workoutsService.assignWorkoutToWeekday(req.user.userId, input);
  }

  @Query(() => [WorkoutScheduleType])
  getWeeklyWorkoutSchedule(@Context('req') req: AuthenticatedRequest) {
    return this.workoutsService.getWeeklyWorkoutSchedule(req.user.userId);
  }
}
