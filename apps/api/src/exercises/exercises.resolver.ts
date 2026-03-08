import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { CreateExerciseInput } from './dto/create-exercise.input';
import { ExerciseType } from './dto/exercise.type';
import { SearchExercisesInput } from './dto/search-exercises.input';
import { ExercisesService } from './exercises.service';

type AuthenticatedRequest = {
  user: {
    userId: string;
    email: string;
  };
};

@Resolver(() => ExerciseType)
@UseGuards(GqlAuthGuard)
export class ExercisesResolver {
  constructor(private readonly exercisesService: ExercisesService) {}

  @Query(() => [ExerciseType])
  searchExercises(
    @Context('req') req: AuthenticatedRequest,
    @Args('input', { nullable: true }) input?: SearchExercisesInput,
  ) {
    return this.exercisesService.searchExercises(req.user.userId, input);
  }

  @Mutation(() => ExerciseType)
  createExercise(
    @Context('req') req: AuthenticatedRequest,
    @Args('input') input: CreateExerciseInput,
  ) {
    return this.exercisesService.createExercise(req.user.userId, input);
  }
}
