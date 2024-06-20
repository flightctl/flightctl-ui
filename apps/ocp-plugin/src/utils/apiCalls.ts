/* eslint-disable no-console */

import { PatchRequest } from '@flightctl/types';

declare global {
  interface Window {
    FCTL_API_PORT?: string;
  }
}

const apiServer = `${window.location.protocol}//${window.location.hostname}${
  window.FCTL_API_PORT ? `:${window.FCTL_API_PORT}` : ''
}/api/proxy/plugin/flightctl-plugin/api-proxy`;

const flightCtlAPI = `${apiServer}/api/flightctl`;
const metricsAPI = `${apiServer}/api/metrics`;

const handleApiJSONResponse = async <R>(response: Response): Promise<R> => {
  if (response.ok) {
    const data = (await response.json()) as R;
    return data;
  }

  if (response.status === 404) {
    // We skip the response message for 404 errors, which is { message: '' }
    throw new Error(`Error ${response.status}: ${response.statusText}`);
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
      method: 'POST',
      body: JSON.stringify(data),
    });
    return handleApiJSONResponse(response);
  } catch (error) {
    console.error('Error making request:', error);
    throw error;
  }
};

export const putData = async <R>(kind: string, data: R): Promise<R> => {
  try {
    const response = await fetch(`${flightCtlAPI}/api/v1/${kind}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'PUT',
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
      signal: abortSignal,
    });
    return handleApiJSONResponse(response);
  } catch (error) {
    console.error('Error making request:', error);
    throw error;
  }
};
