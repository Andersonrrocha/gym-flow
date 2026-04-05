import { gql } from "@apollo/client";

export const LOGIN_MUTATION = gql`
  mutation Login($input: AuthInput!) {
    login(input: $input) {
      success
      accessToken
    }
  }
`;

export type LoginInput = {
  email: string;
  password: string;
};

export type LoginResponse = {
  login: {
    success: boolean;
    accessToken?: string | null;
  };
};
