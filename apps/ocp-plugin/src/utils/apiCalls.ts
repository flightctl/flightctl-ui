/* eslint-disable no-console */

import { PatchRequest } from '@flightctl/types';
import { getCSRFToken } from '@openshift-console/dynamic-plugin-sdk/lib/utils/fetch/console-fetch-utils';
import {
  getErrorMsgFromAlertsApiResponse,
  getErrorMsgFromApiResponse,
} from '@flightctl/ui-components/src/utils/apiCalls';
import { ORGANIZATION_STORAGE_KEY } from '@flightctl/ui-components/src/utils/organizationStorage';

declare global {
  interface Window {
    FCTL_API_PORT?: string;
    isRHEM?: boolean;
  }
}

const addRequiredHeaders = (options: RequestInit): RequestInit => {
  const updatedOptions = { ...options };

  const token = getCSRFToken();
  const orgId = localStorage.getItem(ORGANIZATION_STORAGE_KEY);

  if (updatedOptions.headers) {
    updatedOptions.headers['X-CSRFToken'] = token;
    if (orgId) {
      updatedOptions.headers['X-FlightCtl-Organization-ID'] = orgId;
    }
  } else {
    updatedOptions.headers = orgId
      ? { 'X-CSRFToken': token, 'X-FlightCtl-Organization-ID': orgId }
      : { 'X-CSRFToken': token };
  }

  return updatedOptions;
};

const apiServer = `${window.location.hostname}${
  window.FCTL_API_PORT ? `:${window.FCTL_API_PORT}` : ''
}/api/proxy/plugin/flightctl-plugin/api-proxy`;

export const uiProxy = `${window.location.protocol}//${apiServer}`;
const flightCtlAPI = `${uiProxy}/api/flightctl`;
const alertsAPI = `${uiProxy}/api/alerts`;
export const wsEndpoint = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${apiServer}`;

export const fetchUiProxy = async (endpoint: string, requestInit: RequestInit): Promise<Response> => {
  const options = addRequiredHeaders(requestInit);

  return await fetch(`${uiProxy}/api/${endpoint}`, options);
};

const getFullApiUrl = (path: string) => {
  if (path.startsWith('alerts')) {
    return { api: 'alerts', url: `${alertsAPI}/api/v2/${path}` };
  }
  return { api: 'flightctl', url: `${flightCtlAPI}/api/v1/${path}` };
};

const handleAlertsJSONResponse = async <R>(response: Response): Promise<R> => {
  if (response.ok) {
    const data = (await response.json()) as R;
    return data;
  }

  if (response.status === 404) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }

  // For 500/501 errors, return the status code for detection
  if (response.status === 500 || response.status === 501) {
    throw new Error(`${response.status}`);
  }

  throw new Error(await getErrorMsgFromAlertsApiResponse(response));
};

export const handleApiJSONResponse = async <R>(response: Response): Promise<R> => {
  if (response.ok) {
    const data = (await response.json()) as R;
    return data;
  }

  if (response.status === 404) {
    // We skip the response message for 404 errors, which is { message: '' }
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }

  throw new Error(await getErrorMsgFromApiResponse(response));
};

const putOrPostData = async <TRequest, TResponse = TRequest>(
  kind: string,
  data: TRequest,
  method: 'PUT' | 'POST',
): Promise<TResponse> => {
  const baseOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
    },
    method,
    body: JSON.stringify(data),
  };

  const options = addRequiredHeaders(baseOptions);
  try {
    const response = await fetch(`${flightCtlAPI}/api/v1/${kind}`, options);
    return handleApiJSONResponse(response);
  } catch (error) {
    console.error(`Error making ${method} request for ${kind}:`, error);
    throw error;
  }
};

export const postData = async <TRequest, TResponse = TRequest>(kind: string, data: TRequest): Promise<TResponse> =>
  putOrPostData<TRequest, TResponse>(kind, data, 'POST');

export const putData = async <TRequest>(kind: string, data: TRequest): Promise<TRequest> =>
  putOrPostData<TRequest, TRequest>(kind, data, 'PUT');

export const deleteData = async <R>(kind: string, abortSignal?: AbortSignal): Promise<R> => {
  const baseOptions: RequestInit = {
    method: 'DELETE',
    signal: abortSignal,
  };

  const options = addRequiredHeaders(baseOptions);
  try {
    const response = await fetch(`${flightCtlAPI}/api/v1/${kind}`, options);
    return handleApiJSONResponse(response);
  } catch (error) {
    console.error('Error making DELETE request:', error);
    throw error;
  }
};

export const patchData = async <R>(kind: string, data: PatchRequest, abortSignal?: AbortSignal): Promise<R> => {
  const baseOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json-patch+json',
    },
    method: 'PATCH',
    body: JSON.stringify(data),
    signal: abortSignal,
  };

  const options = addRequiredHeaders(baseOptions);
  try {
    const response = await fetch(`${flightCtlAPI}/api/v1/${kind}`, options);
    return handleApiJSONResponse(response);
  } catch (error) {
    console.error('Error making PATCH request:', error);
    throw error;
  }
};

export const fetchData = async <R>(path: string, abortSignal?: AbortSignal): Promise<R> => {
  try {
    const { api, url } = getFullApiUrl(path);

    const baseOptions: RequestInit = {
      signal: abortSignal,
    };

    const options = addRequiredHeaders(baseOptions);

    const response = await fetch(url, options);
    if (api === 'alerts') {
      return handleAlertsJSONResponse(response);
    }
    return handleApiJSONResponse(response);
  } catch (error) {
    console.error('Error making GET request:', error);
    throw error;
  }
};
