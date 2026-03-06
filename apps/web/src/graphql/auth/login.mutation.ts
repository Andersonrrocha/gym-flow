import { gql } from "@apollo/client";

export const LOGIN_MUTATION = gql`
  mutation Login($input: AuthInput!) {
    login(input: $input) {
      accessToken
      refreshToken
    }
  }
`;

export type LoginInput = {
  email: string;
  password: string;
};

export type LoginResponse = {
  login: {
    accessToken: string;
    refreshToken: string;
  };
};
