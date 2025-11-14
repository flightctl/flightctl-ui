import * as React from 'react';
import { deleteData, fetchData, fetchUiProxy, patchData, postData, putData, wsEndpoint } from '../utils/apiCalls';
import { PatchRequest } from '@flightctl/types';

export const useFetch = () => {
  const get = React.useCallback(
    async <R>(kind: string, abortSignal?: AbortSignal): Promise<R> => fetchData<R>(kind, abortSignal),
    [],
  );

  const post = React.useCallback(
    async <TRequest, TResponse = TRequest>(kind: string, data: TRequest): Promise<TResponse> =>
      postData<TRequest, TResponse>(kind, data),
    [],
  );

  const put = React.useCallback(
    async <TRequest>(kind: string, data: TRequest): Promise<TRequest> => putData<TRequest>(kind, data),
    [],
  );

  const remove = React.useCallback(
    async <R>(kind: string, abortSignal?: AbortSignal): Promise<R> => deleteData(kind, abortSignal),
    [],
  );

  const patch = React.useCallback(
    async <R>(kind: string, obj: PatchRequest, abortSignal?: AbortSignal): Promise<R> =>
      patchData(kind, obj, abortSignal),
    [],
  );

  const getWsEndpoint = React.useCallback((deviceId: string) => `${wsEndpoint}/api/terminal/${deviceId}`, []);

  const proxyFetch = React.useCallback(async (endpoint: string, requestInit: RequestInit): Promise<Response> => {
    return fetchUiProxy(endpoint, requestInit);
  }, []);

  return {
    getWsEndpoint,
    get,
    post,
    put,
    remove,
    patch,
    proxyFetch,
  };
};
