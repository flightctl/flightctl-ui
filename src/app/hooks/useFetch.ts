import * as React from 'react';
import { deleteData, postData, putData } from '@app/old/utils/commonFunctions';
import { useAuth } from './useAuth';

export const useFetch = () => {
  const auth = useAuth();

  const userToken = auth?.user?.access_token;

  const post = React.useCallback(async <R>(kind: string, obj: R) => postData(kind, userToken, obj), [userToken]);

  const put = React.useCallback(async <R>(kind: string, obj: R) => putData(kind, userToken, obj), [userToken]);

  const remove = React.useCallback(async (kind: string) => deleteData(kind, userToken), [userToken]);

  return {
    post,
    remove,
    put,
  };
};
