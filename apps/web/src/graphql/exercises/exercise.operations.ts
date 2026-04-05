import { gql } from "@apollo/client";

export const EXERCISE_FIELDS = gql`
  fragment ExerciseFields on ExerciseType {
    id
    name
    catalogKey
    muscleGroup
    equipment
    isSystem
    createdByUserId
    createdAt
    updatedAt
  }
`;

export const SEARCH_EXERCISES = gql`
  ${EXERCISE_FIELDS}
  query SearchExercises($input: SearchExercisesInput) {
    searchExercises(input: $input) {
      ...ExerciseFields
    }
  }
`;

export const CREATE_EXERCISE = gql`
  ${EXERCISE_FIELDS}
  mutation CreateExercise($input: CreateExerciseInput!) {
    createExercise(input: $input) {
      ...ExerciseFields
    }
  }
`;
