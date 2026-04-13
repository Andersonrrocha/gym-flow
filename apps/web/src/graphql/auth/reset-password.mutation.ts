import { gql } from "@apollo/client";

export const RESET_PASSWORD_MUTATION = gql`
  mutation ResetPassword($input: ResetPasswordInput!) {
    resetPassword(input: $input) {
      success
    }
  }
`;

export type ResetPasswordInput = {
  token: string;
  password: string;
};

export type ResetPasswordResponse = {
  resetPassword: {
    success: boolean;
  };
};
