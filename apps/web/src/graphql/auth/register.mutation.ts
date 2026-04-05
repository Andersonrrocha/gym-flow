import { gql } from "@apollo/client";

export const REGISTER_MUTATION = gql`
  mutation Register($input: AuthInput!) {
    register(input: $input) {
      success
      accessToken
    }
  }
`;

export type RegisterInput = {
  email: string;
  password: string;
};

export type RegisterResponse = {
  register: {
    success: boolean;
    accessToken?: string | null;
  };
};
