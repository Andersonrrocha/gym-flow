import { gql } from "@apollo/client";

export const REGISTER_MUTATION = gql`
  mutation Register($input: AuthInput!) {
    register(input: $input) {
      accessToken
      refreshToken
    }
  }
`;

export type RegisterInput = {
  email: string;
  password: string;
};

export type RegisterResponse = {
  register: {
    accessToken: string;
    refreshToken: string;
  };
};
