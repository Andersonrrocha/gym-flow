import { gql } from "@apollo/client";

export const WORKOUT_SESSION_FIELDS = gql`
  fragment WorkoutSessionFields on WorkoutSessionType {
    id
    userId
    workoutId
    workoutName
    status
    startedAt
    finishedAt
    sessionItems {
      id
      sessionId
      exerciseId
      nameSnapshot
      plannedSets
      plannedReps
      order
      exercise {
        id
        name
        catalogKey
      }
      sets {
        id
        sessionExerciseId
        reps
        weight
        setNumber
        createdAt
      }
    }
  }
`;

export const START_SESSION_FROM_WORKOUT = gql`
  ${WORKOUT_SESSION_FIELDS}
  mutation StartSessionFromWorkout($input: StartWorkoutSessionInput!) {
    startSessionFromWorkout(input: $input) {
      ...WorkoutSessionFields
    }
  }
`;

export const LOG_SESSION_SET = gql`
  mutation LogSessionSet($input: LogSessionSetInput!) {
    logSessionSet(input: $input) {
      id
      sessionExerciseId
      reps
      weight
      setNumber
      createdAt
    }
  }
`;

export const FINISH_WORKOUT_SESSION = gql`
  ${WORKOUT_SESSION_FIELDS}
  mutation FinishWorkoutSession($input: FinishWorkoutSessionInput!) {
    finishWorkoutSession(input: $input) {
      ...WorkoutSessionFields
    }
  }
`;

export const LIST_USER_SESSIONS = gql`
  ${WORKOUT_SESSION_FIELDS}
  query ListUserSessions($status: String) {
    listUserSessions(status: $status) {
      ...WorkoutSessionFields
    }
  }
`;

export const GET_WORKOUT_SESSION = gql`
  ${WORKOUT_SESSION_FIELDS}
  query WorkoutSession($id: ID!) {
    workoutSession(id: $id) {
      ...WorkoutSessionFields
    }
  }
`;
