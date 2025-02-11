/* eslint-disable no-console */
import { PatchRequest } from '@flightctl/types';
import { getErrorMsgFromApiResponse } from '@flightctl/ui-components/src/utils/apiCalls';
import { lastRefresh } from '../context/AuthContext';

const apiPort = window.API_PORT || window.location.port;
const apiServer = `${window.location.hostname}${apiPort ? `:${apiPort}` : ''}`;

const flightCtlAPI = `${window.location.protocol}//${apiServer}/api/flightctl`;
export const loginAPI = `${window.location.protocol}//${apiServer}/api/login`;
const logoutAPI = `${window.location.protocol}//${apiServer}/api/logout`;
const metricsAPI = `${window.location.protocol}//${apiServer}/api/metrics`;
export const wsEndpoint = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${apiServer}`;

export const logout = async () => {
  const response = await fetch(logoutAPI, { credentials: 'include' });
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

const fetchWithRetry = async <R>(input: string | URL | Request, init?: RequestInit): Promise<R> => {
  const prevRefresh = lastRefresh;
  let response = await fetch(input, init);
  //if token refresh occured, lets try again
  if (response.status === 401 && prevRefresh != lastRefresh) {
    response = await fetch(input, init);
  }
  return handleApiJSONResponse(response);
};

export const fetchMetrics = async <R>(metricQuery: string, abortSignal?: AbortSignal): Promise<R> => {
  try {
    const response = await fetch(`${metricsAPI}/api/v1/query_range?${metricQuery}`, {
      signal: abortSignal,
    });
    return handleApiJSONResponse(response);
  } catch (error) {
    console.error('Error making GET request:', error);
    throw error;
  }
};

const putOrPostData = async <R>(kind: string, data: R, method: 'PUT' | 'POST'): Promise<R> => {
  try {
    return await fetchWithRetry<R>(`${flightCtlAPI}/api/v1/${kind}`, {
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

export const postData = async <R>(kind: string, data: R): Promise<R> => putOrPostData(kind, data, 'POST');

export const putData = async <R>(kind: string, data: R): Promise<R> => putOrPostData(kind, data, 'PUT');

export const deleteData = async <R>(kind: string, abortSignal?: AbortSignal): Promise<R> => {
  try {
    return fetchWithRetry<R>(`${flightCtlAPI}/api/v1/${kind}`, {
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
    return fetchWithRetry<R>(`${flightCtlAPI}/api/v1/${kind}`, {
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

export const fetchData = async <R>(kind: string, abortSignal?: AbortSignal): Promise<R> => {
  try {
    return fetchWithRetry<R>(`${flightCtlAPI}/api/v1/${kind}`, {
      credentials: 'include',
      signal: abortSignal,
    });
  } catch (error) {
    console.error('Error making GET request:', error);
    throw error;
  }
};
