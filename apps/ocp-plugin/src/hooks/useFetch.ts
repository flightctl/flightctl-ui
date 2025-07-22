import * as React from 'react';
import {
  deleteData,
  fetchAlerts,
  fetchData,
  handleApiJSONResponse,
  patchData,
  postData,
  putData,
  uiProxy,
  wsEndpoint,
} from '../utils/apiCalls';
import { PatchRequest } from '@flightctl/types';
import { K8sVerb, checkAccess } from '@openshift-console/dynamic-plugin-sdk';

type OcpConfig = {
  rbacNs: string;
};

const useOcpConfig = () => {
  const [config, setConfig] = React.useState<OcpConfig>();

  React.useEffect(() => {
    const doItAsync = async () => {
      try {
        const response = await fetch(`${uiProxy}/api/config`);
        const cfg = await handleApiJSONResponse<OcpConfig>(response);
        setConfig(cfg);
      } catch (error) {
        // eslint-disable-next-line
        console.error('Error making request:', error);
      }
    };
    doItAsync();
  }, []);

  return config;
};

export const useFetch = () => {
  const get = React.useCallback(
    async <R>(kind: string, abortSignal?: AbortSignal): Promise<R> => fetchData(kind, abortSignal),
    [],
  );

  const post = React.useCallback(async <R>(kind: string, obj: R): Promise<R> => postData(kind, obj), []);

  const put = React.useCallback(async <R>(kind: string, obj: R): Promise<R> => putData(kind, obj), []);

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

  const getAlerts = React.useCallback(
    async <R>(abortSignal?: AbortSignal): Promise<R> => fetchAlerts<R>(abortSignal),
    [],
  );

  const ocpConfig = useOcpConfig();

  const checkPermissions = React.useCallback(
    async (resource: string, op: string) => {
      const ssar = await checkAccess({
        group: 'flightctl.io',
        resource,
        verb: op as K8sVerb,
        namespace: ocpConfig?.rbacNs,
      });
      return !!ssar.status?.allowed;
    },
    [ocpConfig],
  );

  return {
    getWsEndpoint,
    get,
    post,
    put,
    remove,
    patch,
    checkPermissions,
    getAlerts,
  };
};
