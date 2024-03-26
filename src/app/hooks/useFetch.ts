import * as React from 'react';
import { deleteData, fetchData, postData, putData } from '@app/utils/apiCalls';
import { useAuth } from './useAuth';

export const useFetch = () => {
  const auth = useAuth();

  const userToken = auth?.user?.access_token;

  const get = React.useCallback(async <R>(kind: string): Promise<R> => fetchData(kind, userToken), [userToken]);

  const post = React.useCallback(async <R>(kind: string, obj: R) => postData(kind, userToken, obj), [userToken]);

  const put = React.useCallback(async <R>(kind: string, obj: R) => putData(kind, userToken, obj), [userToken]);

  const remove = React.useCallback(
    async (kind: string, objId: string) => deleteData(kind, userToken, objId),
    [userToken],
  );

  return {
    get,
    post,
    put,
    remove,
  };
};
