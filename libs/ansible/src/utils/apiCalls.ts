/* eslint-disable no-console */

import { PatchRequest } from '@flightctl/types';

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
    const response = await fetch(`/api/v1/query_range?${metricQuery}`, {
      signal: abortSignal,
    });
    return handleApiJSONResponse(response);
  } catch (error) {
    console.error('Error making request:', error);
    throw error;
  }
};

const putOrPostData = async <R>(
  kind: string,
  data: R,
  serviceUrl: string,
  applyOptions: (options: RequestInit) => RequestInit,
  method: 'PUT' | 'POST',
): Promise<R> => {
  const options: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
    },
    method,
    body: JSON.stringify(data),
  };
  applyOptions(options);
  try {
    const response = await fetch(`${serviceUrl}/api/v1/${kind}`, options);
    return handleApiJSONResponse(response);
  } catch (error) {
    console.error('Error making request:', error);
    throw error;
  }
};

export const postData = async <R>(
  kind: string,
  data: R,
  serviceUrl: string,
  applyOptions: (options: RequestInit) => RequestInit,
) => putOrPostData(kind, data, serviceUrl, applyOptions, 'POST');

export const putData = async <R>(
  kind: string,
  data: R,
  serviceUrl: string,
  applyOptions: (options: RequestInit) => RequestInit,
) => putOrPostData(kind, data, serviceUrl, applyOptions, 'PUT');

export const deleteData = async <R>(
  kind: string,
  serviceUrl: string,
  applyOptions: (options: RequestInit) => RequestInit,
  abortSignal?: AbortSignal,
): Promise<R> => {
  const options: RequestInit = {
    method: 'DELETE',
    signal: abortSignal,
  };
  applyOptions(options);
  try {
    const response = await fetch(`${serviceUrl}/api/v1/${kind}`, options);
    return handleApiJSONResponse(response);
  } catch (error) {
    console.error('Error making request:', error);
    throw error;
  }
};

export const patchData = async <R>(
  kind: string,
  data: PatchRequest,
  serviceUrl: string,
  applyOptions: (options: RequestInit) => RequestInit,
  abortSignal?: AbortSignal,
): Promise<R> => {
  const options: RequestInit = {
    headers: {
      'Content-Type': 'application/json-patch+json',
    },
    method: 'PATCH',
    body: JSON.stringify(data),
    signal: abortSignal,
  };
  applyOptions(options);
  try {
    const response = await fetch(`${serviceUrl}/api/v1/${kind}`, options);
    return handleApiJSONResponse(response);
  } catch (error) {
    console.error('Error making request:', error);
    throw error;
  }
};

export const fetchData = async <R>(kind: string, serviceUrl: string, abortSignal?: AbortSignal): Promise<R> => {
  try {
    const response = await fetch(`${serviceUrl}/api/v1/${kind}`, {
      signal: abortSignal,
    });
    return handleApiJSONResponse(response);
  } catch (error) {
    console.error('Error making request:', error);
    throw error;
  }
};
