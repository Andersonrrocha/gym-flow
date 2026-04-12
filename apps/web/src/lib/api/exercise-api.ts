import type { ApolloClient } from "@apollo/client";
import type { Exercise, MuscleGroup, Equipment } from "@/types/workouts";
import {
  SEARCH_EXERCISES,
  CREATE_EXERCISE,
} from "@/graphql/exercises/exercise.operations";

function logExerciseDebug(message: string, err: unknown) {
  if (process.env.NODE_ENV === "development") {
    console.warn(`[exercise-api] ${message}`, err);
  }
}

type GqlExercise = {
  id: string;
  name: string;
  catalogKey?: string | null;
  muscleGroup: string | null;
  equipment: string | null;
  isSystem: boolean;
  createdByUserId: string | null;
};

function mapGqlExerciseToUi(data: GqlExercise): Exercise {
  return {
    id: data.id,
    name: data.name,
    catalogKey: data.catalogKey ?? null,
    muscleGroup: (data.muscleGroup as MuscleGroup) ?? null,
    equipment: (data.equipment as Equipment) ?? null,
    isSystem: data.isSystem,
  };
}

export type SearchExercisesInput = {
  query?: string;
  muscleGroup?: string;
  equipment?: string;
};

export async function searchExercisesApi(
  client: ApolloClient,
  input?: SearchExercisesInput,
): Promise<Exercise[]> {
  const variables = { input: input ?? null };
  try {
    const { data } = await client.query<{
      searchExercises: GqlExercise[];
    }>({
      query: SEARCH_EXERCISES,
      variables,
      fetchPolicy: "network-only",
    });
    return (data?.searchExercises ?? []).map(mapGqlExerciseToUi);
  } catch (e) {
    logExerciseDebug("searchExercises network failed, trying cache", e);
    try {
      const { data } = await client.query<{
        searchExercises: GqlExercise[];
      }>({
        query: SEARCH_EXERCISES,
        variables,
        fetchPolicy: "cache-only",
      });
      if (data?.searchExercises?.length) {
        return data.searchExercises.map(mapGqlExerciseToUi);
      }
    } catch {
      /* cache miss — fall through */
    }
    return [];
  }
}

export type CreateExerciseInput = {
  name: string;
  muscleGroup?: string;
  equipment?: string;
};

export async function createExerciseApi(
  client: ApolloClient,
  input: CreateExerciseInput,
): Promise<Exercise | null> {
  try {
    const { data } = await client.mutate<{
      createExercise: GqlExercise;
    }>({
      mutation: CREATE_EXERCISE,
      variables: { input },
      update(cache) {
        cache.evict({ fieldName: "searchExercises" });
        cache.gc();
      },
    });
    if (!data?.createExercise) return null;
    return mapGqlExerciseToUi(data.createExercise);
  } catch (e) {
    logExerciseDebug("createExercise failed", e);
    return null;
  }
}
