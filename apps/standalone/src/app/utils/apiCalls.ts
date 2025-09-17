/* eslint-disable no-console */
import { PatchRequest } from '@flightctl/types';
import {
  getErrorMsgFromAlertsApiResponse,
  getErrorMsgFromApiResponse,
} from '@flightctl/ui-components/src/utils/apiCalls';

import { lastRefresh } from '../context/AuthContext';

const apiPort = window.API_PORT || window.location.port;
const apiServer = `${window.location.hostname}${apiPort ? `:${apiPort}` : ''}`;

const flightCtlAPI = `${window.location.protocol}//${apiServer}/api/flightctl`;
const uiProxyAPI = `${window.location.protocol}//${apiServer}/api`;

export const loginAPI = `${window.location.protocol}//${apiServer}/api/login`;
export const wsEndpoint = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${apiServer}`;

// Helper function to add organization header to request options
const addOrganizationHeader = (options: RequestInit): RequestInit => {
  const orgId = localStorage.getItem('flightctl-current-organization');
  if (orgId) {
    return {
      ...options,
      headers: {
        ...options.headers,
        'X-FlightCtl-Organization-ID': orgId,
      },
    };
  }
  return options;
};

export const fetchUiProxy = async (endpoint: string, requestInit: RequestInit): Promise<Response> => {
  const baseOptions = {
    credentials: 'include',
    ...requestInit,
  } as RequestInit;

  const options = addOrganizationHeader(baseOptions);

  return await fetch(`${uiProxyAPI}/${endpoint}`, options);
};

const getFullApiUrl = (path: string) => {
  if (path.startsWith('alerts')) {
    return { api: 'alerts', url: `${uiProxyAPI}/alerts/api/v2/${path}` };
  }
  return { api: 'flightctl', url: `${flightCtlAPI}/api/v1/${path}` };
};

export const logout = async () => {
  const response = await fetch(`${uiProxyAPI}/logout`, { credentials: 'include' });
  const { url } = (await response.json()) as { url: string };
  url ? (window.location.href = url) : window.location.reload();
};

export const redirectToLogin = async () => {
  const response = await fetch(loginAPI);
  const { url } = (await response.json()) as { url: string };
  window.location.href = url;
};

const handleApiJSONResponse = async <R>(response: Response): Promise<R> => {
  if (response.ok) {
    const data = (await response.json()) as R;
    return data;
  }

  if (response.status === 404) {
    // We skip the response message for 404 errors, which is { message: '' }
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }

  if (response.status === 401) {
    await redirectToLogin();
  }

  throw new Error(await getErrorMsgFromApiResponse(response));
};

const handleAlertsJSONResponse = async <R>(response: Response): Promise<R> => {
  if (response.ok) {
    const data = (await response.json()) as R;
    return data;
  }

  if (response.status === 404) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }

  if (response.status === 401) {
    await redirectToLogin();
  }

  // For 500/501 errors, return the status code for detection
  if (response.status === 500 || response.status === 501) {
    throw new Error(`${response.status}`);
  }

  throw new Error(await getErrorMsgFromAlertsApiResponse(response));
};

const fetchWithRetry = async <R>(path: string, init?: RequestInit): Promise<R> => {
  const { api, url } = getFullApiUrl(path);

  // Add organization header if available
  const options = addOrganizationHeader({ ...init });

  const prevRefresh = lastRefresh;
  let response = await fetch(url, options);
  //if token refresh occured, lets try again
  if (response.status === 401 && prevRefresh != lastRefresh) {
    response = await fetch(url, options);
  }
  if (api === 'alerts') {
    return handleAlertsJSONResponse(response);
  }
  return handleApiJSONResponse(response);
};

const putOrPostData = async <TRequest, TResponse = TRequest>(
  kind: string,
  data: TRequest,
  method: 'PUT' | 'POST',
): Promise<TResponse> => {
  try {
    return await fetchWithRetry<TResponse>(kind, {
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      method,
      body: JSON.stringify(data),
    });
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
  try {
    return fetchWithRetry<R>(kind, {
      method: 'DELETE',
      credentials: 'include',
      signal: abortSignal,
    });
  } catch (error) {
    console.error('Error making DELETE request:', error);
    throw error;
  }
};

export const patchData = async <R>(kind: string, data: PatchRequest, abortSignal?: AbortSignal): Promise<R> => {
  try {
    return fetchWithRetry<R>(kind, {
      headers: {
        'Content-Type': 'application/json-patch+json',
      },
      method: 'PATCH',
      credentials: 'include',
      body: JSON.stringify(data),
      signal: abortSignal,
    });
  } catch (error) {
    console.error('Error making PATCH request:', error);
    throw error;
  }
};

export const fetchData = async <R>(path: string, abortSignal?: AbortSignal): Promise<R> => {
  try {
    return fetchWithRetry<R>(path, {
      credentials: 'include',
      signal: abortSignal,
    });
  } catch (error) {
    console.error('Error making GET request:', error);
    throw error;
  }
};
