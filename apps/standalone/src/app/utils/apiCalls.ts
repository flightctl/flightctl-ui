/* eslint-disable no-console */
import { PatchRequest } from '@flightctl/types';

const apiServer = `${window.location.hostname}${window.API_PORT ? `:${window.API_PORT}` : ''}`;

const flightCtlAPI = `${window.location.protocol}//${apiServer}/api/flightctl`;
export const loginAPI = `${window.location.protocol}//${apiServer}/api/login`;
const logoutAPI = `${window.location.protocol}//${apiServer}/api/logout`;
const metricsAPI = `${window.location.protocol}//${apiServer}/api/metrics`;
export const wsEndpoint = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${apiServer}`;
const deviceImagesAPI = `${window.location.protocol}//${apiServer}/api/device-images`;

export const logout = async () => {
  const response = await fetch(logoutAPI);
  const { url } = (await response.json()) as { url: string };
  window.location.href = url;
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

  let errorText = '';
  try {
    const json = (await response.json()) as { message: string } | string;
    errorText = ` - ${typeof json === 'object' ? json.message : json}`;
  } catch (e) {
    // ignore
  }
  throw new Error(`Error ${response.status}: ${response.statusText}${errorText}`);
};

export const fetchMetrics = async <R>(metricQuery: string, abortSignal?: AbortSignal): Promise<R> => {
  try {
    const response = await fetch(`${metricsAPI}/api/v1/query_range?${metricQuery}`, {
      signal: abortSignal,
    });
    return handleApiJSONResponse(response);
  } catch (error) {
    console.error('Error making request:', error);
    throw error;
  }
};

export const postData = async <R>(kind: string, data: R): Promise<R> => {
  try {
    const response = await fetch(`${flightCtlAPI}/api/v1/${kind}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      method: 'POST',
      body: JSON.stringify(data),
    });
    return handleApiJSONResponse(response);
  } catch (error) {
    console.error('Error making request:', error);
    throw error;
  }
};

export const deleteData = async <R>(kind: string, abortSignal?: AbortSignal): Promise<R> => {
  try {
    const response = await fetch(`${flightCtlAPI}/api/v1/${kind}`, {
      method: 'DELETE',
      credentials: 'include',
      signal: abortSignal,
    });
    return handleApiJSONResponse(response);
  } catch (error) {
    console.error('Error making request:', error);
    throw error;
  }
};

export const patchData = async <R>(kind: string, data: PatchRequest, abortSignal?: AbortSignal): Promise<R> => {
  try {
    const response = await fetch(`${flightCtlAPI}/api/v1/${kind}`, {
      headers: {
        'Content-Type': 'application/json-patch+json',
      },
      method: 'PATCH',
      credentials: 'include',
      body: JSON.stringify(data),
      signal: abortSignal,
    });
    return handleApiJSONResponse(response);
  } catch (error) {
    console.error('Error making request:', error);
    throw error;
  }
};

export const fetchData = async <R>(kind: string, abortSignal?: AbortSignal): Promise<R> => {
  try {
    const response = await fetch(`${flightCtlAPI}/api/v1/${kind}`, {
      credentials: 'include',
      signal: abortSignal,
    });
    return handleApiJSONResponse(response);
  } catch (error) {
    console.error('Error making request:', error);
    throw error;
  }
};

export type DeviceImages = {
  bootc: string;
  qcow2: string;
};

export const fetchImages = async () => {
  try {
    const response = await fetch(deviceImagesAPI);
    return handleApiJSONResponse<DeviceImages>(response);
  } catch (error) {
    console.error('Error making request:', error);
    throw error;
  }
};
