import { gql } from "@apollo/client";

export const REQUEST_PASSWORD_RESET_MUTATION = gql`
  mutation RequestPasswordReset($input: RequestPasswordResetInput!) {
    requestPasswordReset(input: $input) {
      success
    }
  }
`;

export type RequestPasswordResetInput = {
  email: string;
  locale?: string | null;
};

export type RequestPasswordResetResponse = {
  requestPasswordReset: {
    success: boolean;
  };
};
