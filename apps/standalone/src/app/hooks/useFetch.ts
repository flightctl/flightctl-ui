import * as React from 'react';
import { deleteData, fetchData, patchData, postData, wsEndpoint } from '../utils/apiCalls';
import { useAuth } from './useAuth';
import { PatchRequest } from '@flightctl/types';

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

  const remove = React.useCallback(
    async <R>(kind: string, abortSignal?: AbortSignal): Promise<R> => deleteData(kind, userToken, abortSignal),
    [userToken],
  );

  const patch = React.useCallback(
    async <R>(kind: string, obj: PatchRequest, abortSignal?: AbortSignal): Promise<R> =>
      patchData(kind, userToken, obj, abortSignal),
    [userToken],
  );

  const getWsEndpoint = React.useCallback(() => {
    const protocols = ['flightctl.standalone.auth'];
    userToken && protocols.push(userToken);
    return {
      wsEndpoint,
      protocols,
    };
  }, [userToken]);

  return {
    getWsEndpoint,
    get,
    post,
    remove,
    patch,
  };
};
