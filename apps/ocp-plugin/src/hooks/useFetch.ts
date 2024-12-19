import * as React from 'react';
import { deleteData, fetchData, patchData, postData, wsEndpoint } from '../utils/apiCalls';
import { PatchRequest } from '@flightctl/types';
import { K8sVerb, checkAccess } from '@openshift-console/dynamic-plugin-sdk';

export const useFetch = () => {
  const get = React.useCallback(
    async <R>(kind: string, abortSignal?: AbortSignal): Promise<R> => fetchData(kind, abortSignal),
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

  const getWsEndpoint = React.useCallback(
    () => ({
      wsEndpoint,
      protocols: ['flightctl.ocp.auth'],
    }),
    [],
  );

  const checkPermissions = React.useCallback(async (resource: string, op: string) => {
    const ssar = await checkAccess({
      group: 'flightctl.io',
      resource,
      verb: op as K8sVerb,
    });
    return !!ssar.status?.allowed;
  }, []);

  return {
    getWsEndpoint,
    get,
    post,
    remove,
    patch,
    checkPermissions,
  };
};
