import { gql } from "@apollo/client";

export const REGISTER_MUTATION = gql`
  mutation Register($input: AuthInput!) {
    register(input: $input) {
      success
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
  };
};
