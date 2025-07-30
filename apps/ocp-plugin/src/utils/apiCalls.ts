/* eslint-disable no-console */

import { PatchRequest } from '@flightctl/types';
import { getCSRFToken } from '@openshift-console/dynamic-plugin-sdk/lib/utils/fetch/console-fetch-utils';
import {
  getErrorMsgFromAlertsApiResponse,
  getErrorMsgFromApiResponse,
} from '@flightctl/ui-components/src/utils/apiCalls';

declare global {
  interface Window {
    FCTL_API_PORT?: string;
    isRHEM?: boolean;
  }
}

export const applyConsoleHeaders = (options: RequestInit) => {
  const token = getCSRFToken();
  if (options.headers) {
    options.headers['X-CSRFToken'] = token;
  } else {
    options.headers = { 'X-CSRFToken': token };
  }
  return options;
};

const apiServer = `${window.location.hostname}${
  window.FCTL_API_PORT ? `:${window.FCTL_API_PORT}` : ''
}/api/proxy/plugin/flightctl-plugin/api-proxy`;

export const uiProxy = `${window.location.protocol}//${apiServer}`;
const flightCtlAPI = `${uiProxy}/api/flightctl`;
const metricsAPI = `${uiProxy}/api/metrics`;
const alertsAPI = `${uiProxy}/api/alerts`;
export const wsEndpoint = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${apiServer}`;

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

export const fetchAlerts = async <R>(abortSignal?: AbortSignal): Promise<R> => {
  const options: RequestInit = {
    signal: abortSignal,
  };
  applyConsoleHeaders(options);
  try {
    const response = await fetch(`${alertsAPI}/api/v2/alerts`, options);

    if (response.ok) {
      const data = (await response.json()) as R;
      return data;
    }

    if (response.status === 404) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    // For 500/501 errors, just throw the status code for detection
    if (response.status === 500 || response.status === 501) {
      throw { status: response.status };
    }

    throw new Error(await getErrorMsgFromAlertsApiResponse(response));
  } catch (error) {
    console.error('Error making GET alerts request:', error);
    throw error;
  }
};

const putOrPostData = async <R>(kind: string, data: R, method: 'PUT' | 'POST'): Promise<R> => {
  const options: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
    },
    method,
    body: JSON.stringify(data),
  };
  applyConsoleHeaders(options);
  try {
    const response = await fetch(`${flightCtlAPI}/api/v1/${kind}`, options);
    return handleApiJSONResponse(response);
  } catch (error) {
    console.error(`Error making ${method} request for ${kind}:`, error);
    throw error;
  }
};

export const postData = async <R>(kind: string, data: R): Promise<R> => putOrPostData(kind, data, 'POST');

export const putData = async <R>(kind: string, data: R): Promise<R> => putOrPostData(kind, data, 'PUT');

export const deleteData = async <R>(kind: string, abortSignal?: AbortSignal): Promise<R> => {
  const options: RequestInit = {
    method: 'DELETE',
    signal: abortSignal,
  };
  applyConsoleHeaders(options);
  try {
    const response = await fetch(`${flightCtlAPI}/api/v1/${kind}`, options);
    return handleApiJSONResponse(response);
  } catch (error) {
    console.error('Error making DELETE request:', error);
    throw error;
  }
};

export const patchData = async <R>(kind: string, data: PatchRequest, abortSignal?: AbortSignal): Promise<R> => {
  const options: RequestInit = {
    headers: {
      'Content-Type': 'application/json-patch+json',
    },
    method: 'PATCH',
    body: JSON.stringify(data),
    signal: abortSignal,
  };
  applyConsoleHeaders(options);
  try {
    const response = await fetch(`${flightCtlAPI}/api/v1/${kind}`, options);
    return handleApiJSONResponse(response);
  } catch (error) {
    console.error('Error making PATCH request:', error);
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
    console.error('Error making GET request:', error);
    throw error;
  }
};
