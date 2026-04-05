import { gql } from "@apollo/client";

export const REFRESH_SESSION_MUTATION = gql`
  mutation RefreshSession {
    refreshSession {
      success
      accessToken
    }
  }
`;

export type RefreshSessionResponse = {
  refreshSession: {
    success: boolean;
    accessToken: string | null;
  };
};
