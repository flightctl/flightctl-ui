import * as React from 'react';
import { deleteData, fetchData, patchData, postData, wsEndpoint } from '../utils/apiCalls';
import { PatchRequest } from '@flightctl/types';

export const useFetch = () => {
  const get = React.useCallback(
    async <R>(kind: string, abortSignal?: AbortSignal): Promise<R> => fetchData<R>(kind, abortSignal),
    [],
  );

  const post = React.useCallback(async <R>(kind: string, obj: R): Promise<R> => postData(kind, obj), []);

  const remove = React.useCallback(
    async <R>(kind: string, abortSignal?: AbortSignal): Promise<R> => deleteData(kind, abortSignal),
    [],
  );

  const patch = React.useCallback(
    async <R>(kind: string, obj: PatchRequest, abortSignal?: AbortSignal): Promise<R> =>
      patchData(kind, obj, abortSignal),
    [],
  );

  const getWsEndpoint = React.useCallback(() => {
    const protocols = ['flightctl.standalone.auth'];
    return {
      wsEndpoint,
      protocols,
    };
  }, []);

  const checkPermissions = React.useCallback(() => Promise.resolve(true), []);

  return {
    getWsEndpoint,
    get,
    post,
    remove,
    patch,
    checkPermissions,
  };
};
