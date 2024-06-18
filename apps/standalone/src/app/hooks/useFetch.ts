import * as React from 'react';
import { deleteData, fetchData, patchData, postData, putData } from '../utils/apiCalls';
import { useAuth } from './useAuth';
import { JSONPatch } from '@flightctl/ui-components/src/hooks/useAppContext';

export const useFetch = () => {
  const auth = useAuth();

  const userToken = auth?.user?.access_token;

  const get = React.useCallback(
    async <R>(kind: string, abortSignal?: AbortSignal): Promise<R> => fetchData<R>(kind, userToken, abortSignal),
    [userToken],
  );

  const post = React.useCallback(
    async <R>(kind: string, obj: R): Promise<R> => postData(kind, userToken, obj),
    [userToken],
  );

  const put = React.useCallback(
    async <R>(kind: string, obj: R): Promise<R> => putData(kind, userToken, obj),
    [userToken],
  );

  const remove = React.useCallback(
    async <R>(kind: string, abortSignal?: AbortSignal): Promise<R> => deleteData(kind, userToken, abortSignal),
    [userToken],
  );

  const patch = React.useCallback(
    async <R>(kind: string, obj: JSONPatch[], abortSignal?: AbortSignal): Promise<R> =>
      patchData(kind, userToken, obj, abortSignal),
    [userToken],
  );

  return {
    get,
    post,
    put,
    remove,
    patch,
  };
};
