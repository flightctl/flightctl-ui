import * as React from 'react';
import { deleteData, postData } from '@app/utils/commonFunctions';
import { useAuth } from 'react-oidc-context';

export const useFetch = () => {
  const auth = useAuth();

  const post = React.useCallback(
    async <R>(kind: string, obj: R) => {
      if (auth.user?.access_token) {
        return postData(kind, auth.user.access_token, obj);
      }
    },
    [auth.user?.access_token],
  );

  const remove = React.useCallback(
    async (kind: string) => {
      if (auth.user?.access_token) {
        return deleteData(kind, auth.user.access_token);
      }
    },
    [auth.user?.access_token],
  );

  return {
    post,
    remove,
  };
};
