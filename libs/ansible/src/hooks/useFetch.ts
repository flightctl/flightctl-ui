import * as React from 'react';
import { deleteData, fetchData, patchData, postData, putData } from '../utils/apiCalls';
import { PatchRequest } from '@flightctl/types';

export const useFetch = (getCookie: (name: string) => string | undefined, serviceUrl = '') => {
  const applyHeaders = React.useCallback(
    (options: RequestInit) => {
      const token = getCookie('csrftoken');
      if (token) {
        if (options.headers) {
          options.headers['X-CSRFToken'] = token;
        } else {
          options.headers = { 'X-CSRFToken': token };
        }
      }
      return options;
    },
    [getCookie],
  );

  const get = React.useCallback(
    async <R>(kind: string, abortSignal?: AbortSignal): Promise<R> => fetchData(kind, serviceUrl, abortSignal),
    [serviceUrl],
  );

  const post = React.useCallback(
    async <R>(kind: string, obj: R): Promise<R> => postData(kind, obj, serviceUrl, applyHeaders),
    [serviceUrl, applyHeaders],
  );

  const put = React.useCallback(
    async <R>(kind: string, obj: R): Promise<R> => putData(kind, obj, serviceUrl, applyHeaders),
    [serviceUrl, applyHeaders],
  );

  const remove = React.useCallback(
    async <R>(kind: string, abortSignal?: AbortSignal): Promise<R> =>
      deleteData(kind, serviceUrl, applyHeaders, abortSignal),
    [serviceUrl, applyHeaders],
  );

  const patch = React.useCallback(
    async <R>(kind: string, obj: PatchRequest, abortSignal?: AbortSignal): Promise<R> =>
      patchData(kind, obj, serviceUrl, applyHeaders, abortSignal),
    [serviceUrl, applyHeaders],
  );

  const getWsEndpoint = React.useCallback(
    (deviceId: string) => `${serviceUrl}/ws/v1/devices/${deviceId}/console`,
    [serviceUrl],
  );

  const checkPermissions = React.useCallback(() => Promise.resolve(true), []);

  return {
    getWsEndpoint,
    get,
    post,
    put,
    remove,
    patch,
    checkPermissions,
  };
};
