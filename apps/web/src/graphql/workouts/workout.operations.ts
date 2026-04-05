import { gql } from "@apollo/client";

export const WORKOUT_FIELDS = gql`
  fragment WorkoutFields on WorkoutType {
    id
    name
    description
    exercises {
      id
      exerciseId
      order
      plannedSets
      plannedReps
      restSeconds
      exercise {
        id
        name
        catalogKey
        muscleGroup
        equipment
        isSystem
      }
    }
  }
`;

export const LIST_USER_WORKOUTS = gql`
  ${WORKOUT_FIELDS}
  query ListUserWorkouts {
    listUserWorkouts {
      ...WorkoutFields
    }
  }
`;

export const GET_WORKOUT_DETAILS = gql`
  ${WORKOUT_FIELDS}
  query GetWorkoutDetails($workoutId: String!) {
    getWorkoutDetails(input: { workoutId: $workoutId }) {
      ...WorkoutFields
    }
  }
`;

export const CREATE_WORKOUT = gql`
  ${WORKOUT_FIELDS}
  mutation CreateWorkout($input: CreateWorkoutInput!) {
    createWorkout(input: $input) {
      ...WorkoutFields
    }
  }
`;

export const UPDATE_WORKOUT = gql`
  ${WORKOUT_FIELDS}
  mutation UpdateWorkout($input: UpdateWorkoutInput!) {
    updateWorkout(input: $input) {
      ...WorkoutFields
    }
  }
`;

export const ADD_EXERCISE_TO_WORKOUT = gql`
  ${WORKOUT_FIELDS}
  mutation AddExerciseToWorkout($input: AddExerciseToWorkoutInput!) {
    addExerciseToWorkout(input: $input) {
      ...WorkoutFields
    }
  }
`;

export const REMOVE_WORKOUT_EXERCISE = gql`
  ${WORKOUT_FIELDS}
  mutation RemoveWorkoutExercise($input: RemoveWorkoutExerciseInput!) {
    removeWorkoutExercise(input: $input) {
      ...WorkoutFields
    }
  }
`;

export const UPDATE_WORKOUT_EXERCISE = gql`
  ${WORKOUT_FIELDS}
  mutation UpdateWorkoutExercise($input: UpdateWorkoutExerciseInput!) {
    updateWorkoutExercise(input: $input) {
      ...WorkoutFields
    }
  }
`;

export const REORDER_WORKOUT_EXERCISES = gql`
  ${WORKOUT_FIELDS}
  mutation ReorderWorkoutExercises($input: ReorderWorkoutExercisesInput!) {
    reorderWorkoutExercises(input: $input) {
      ...WorkoutFields
    }
  }
`;

export const DELETE_WORKOUT = gql`
  mutation DeleteWorkout($input: DeleteWorkoutInput!) {
    deleteWorkout(input: $input)
  }
`;
