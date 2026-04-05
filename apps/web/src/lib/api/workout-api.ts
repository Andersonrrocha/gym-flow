import type { ApolloClient } from "@apollo/client";
import type { Workout, WorkoutExercise, Exercise, MuscleGroup, Equipment } from "@/types/workouts";
import {
  LIST_USER_WORKOUTS,
  GET_WORKOUT_DETAILS,
  CREATE_WORKOUT,
  UPDATE_WORKOUT,
  ADD_EXERCISE_TO_WORKOUT,
  REMOVE_WORKOUT_EXERCISE,
  UPDATE_WORKOUT_EXERCISE,
  REORDER_WORKOUT_EXERCISES,
  DELETE_WORKOUT,
} from "@/graphql/workouts/workout.operations";

function logWorkoutDebug(message: string, err: unknown) {
  if (process.env.NODE_ENV === "development") {
    console.warn(`[workout-api] ${message}`, err);
  }
}

type GqlExercise = {
  id: string;
  name: string;
  catalogKey?: string | null;
  muscleGroup?: string | null;
  equipment?: string | null;
  isSystem: boolean;
};

type GqlWorkoutExercise = {
  id: string;
  exerciseId: string;
  order: number;
  plannedSets?: number | null;
  plannedReps?: string | null;
  restSeconds?: number | null;
  exercise: GqlExercise;
};

type GqlWorkout = {
  id: string;
  name: string;
  description?: string | null;
  exercises: GqlWorkoutExercise[];
};

function mapGqlExercise(e: GqlExercise): Exercise {
  return {
    id: e.id,
    name: e.name,
    catalogKey: e.catalogKey ?? null,
    muscleGroup: (e.muscleGroup as MuscleGroup | null) ?? null,
    equipment: (e.equipment as Equipment | null) ?? null,
    isSystem: e.isSystem,
  };
}

function mapGqlWorkoutExercise(we: GqlWorkoutExercise): WorkoutExercise {
  return {
    id: we.id,
    exercise: mapGqlExercise(we.exercise),
    order: we.order,
    plannedSets: we.plannedSets ?? null,
    plannedReps: we.plannedReps ?? null,
    restSeconds: we.restSeconds ?? null,
  };
}

export function mapGqlWorkoutToUi(gql: GqlWorkout): Workout {
  return {
    id: gql.id,
    name: gql.name,
    description: gql.description ?? null,
    exercises: gql.exercises.map(mapGqlWorkoutExercise),
  };
}

export async function listUserWorkoutsApi(
  client: ApolloClient,
): Promise<Workout[]> {
  try {
    const { data } = await client.query<{
      listUserWorkouts: GqlWorkout[];
    }>({
      query: LIST_USER_WORKOUTS,
      fetchPolicy: "network-only",
    });
    return (data?.listUserWorkouts ?? []).map(mapGqlWorkoutToUi);
  } catch (e) {
    logWorkoutDebug("listUserWorkouts failed", e);
    return [];
  }
}

export async function getWorkoutDetailsApi(
  client: ApolloClient,
  workoutId: string,
): Promise<Workout | null> {
  try {
    const { data } = await client.query<{
      getWorkoutDetails: GqlWorkout;
    }>({
      query: GET_WORKOUT_DETAILS,
      variables: { workoutId },
      fetchPolicy: "network-only",
    });
    if (!data?.getWorkoutDetails) return null;
    return mapGqlWorkoutToUi(data.getWorkoutDetails);
  } catch (e) {
    logWorkoutDebug("getWorkoutDetails failed", e);
    return null;
  }
}

export async function createWorkoutApi(
  client: ApolloClient,
  name: string,
): Promise<Workout | null> {
  try {
    const { data } = await client.mutate<{
      createWorkout: GqlWorkout;
    }>({
      mutation: CREATE_WORKOUT,
      variables: { input: { name } },
    });
    if (!data?.createWorkout) return null;
    return mapGqlWorkoutToUi(data.createWorkout);
  } catch (e) {
    logWorkoutDebug("createWorkout failed", e);
    return null;
  }
}

export async function updateWorkoutApi(
  client: ApolloClient,
  workoutId: string,
  fields: { name?: string; description?: string },
): Promise<Workout | null> {
  try {
    const { data } = await client.mutate<{
      updateWorkout: GqlWorkout;
    }>({
      mutation: UPDATE_WORKOUT,
      variables: { input: { workoutId, ...fields } },
    });
    if (!data?.updateWorkout) return null;
    return mapGqlWorkoutToUi(data.updateWorkout);
  } catch (e) {
    logWorkoutDebug("updateWorkout failed", e);
    return null;
  }
}

export async function addExerciseToWorkoutApi(
  client: ApolloClient,
  workoutId: string,
  exerciseId: string,
  opts?: { plannedSets?: number; plannedReps?: string },
): Promise<Workout | null> {
  try {
    const { data } = await client.mutate<{
      addExerciseToWorkout: GqlWorkout;
    }>({
      mutation: ADD_EXERCISE_TO_WORKOUT,
      variables: {
        input: {
          workoutId,
          exerciseId,
          plannedSets: opts?.plannedSets ?? 3,
          plannedReps: opts?.plannedReps ?? "8",
        },
      },
    });
    if (!data?.addExerciseToWorkout) return null;
    return mapGqlWorkoutToUi(data.addExerciseToWorkout);
  } catch (e) {
    logWorkoutDebug("addExerciseToWorkout failed", e);
    return null;
  }
}

export async function removeWorkoutExerciseApi(
  client: ApolloClient,
  workoutExerciseId: string,
): Promise<Workout | null> {
  try {
    const { data } = await client.mutate<{
      removeWorkoutExercise: GqlWorkout;
    }>({
      mutation: REMOVE_WORKOUT_EXERCISE,
      variables: { input: { workoutExerciseId } },
    });
    if (!data?.removeWorkoutExercise) return null;
    return mapGqlWorkoutToUi(data.removeWorkoutExercise);
  } catch (e) {
    logWorkoutDebug("removeWorkoutExercise failed", e);
    return null;
  }
}

export async function updateWorkoutExerciseApi(
  client: ApolloClient,
  workoutExerciseId: string,
  fields: { plannedSets?: number; plannedReps?: string },
): Promise<Workout | null> {
  try {
    const { data } = await client.mutate<{
      updateWorkoutExercise: GqlWorkout;
    }>({
      mutation: UPDATE_WORKOUT_EXERCISE,
      variables: { input: { workoutExerciseId, ...fields } },
    });
    if (!data?.updateWorkoutExercise) return null;
    return mapGqlWorkoutToUi(data.updateWorkoutExercise);
  } catch (e) {
    logWorkoutDebug("updateWorkoutExercise failed", e);
    return null;
  }
}

export async function reorderWorkoutExercisesApi(
  client: ApolloClient,
  workoutId: string,
  orderedWorkoutExerciseIds: string[],
): Promise<Workout | null> {
  try {
    const { data } = await client.mutate<{
      reorderWorkoutExercises: GqlWorkout;
    }>({
      mutation: REORDER_WORKOUT_EXERCISES,
      variables: { input: { workoutId, orderedWorkoutExerciseIds } },
    });
    if (!data?.reorderWorkoutExercises) return null;
    return mapGqlWorkoutToUi(data.reorderWorkoutExercises);
  } catch (e) {
    logWorkoutDebug("reorderWorkoutExercises failed", e);
    return null;
  }
}

export async function deleteWorkoutApi(
  client: ApolloClient,
  workoutId: string,
): Promise<boolean> {
  try {
    const { data } = await client.mutate<{
      deleteWorkout: boolean;
    }>({
      mutation: DELETE_WORKOUT,
      variables: { input: { workoutId } },
    });
    return data?.deleteWorkout === true;
  } catch (e) {
    logWorkoutDebug("deleteWorkout failed", e);
    return false;
  }
}
