/* eslint-disable no-console */

import { PatchRequest } from '@flightctl/types';
import { getErrorMsgFromApiResponse } from '@flightctl/ui-components/src/utils/apiCalls';

const handleApiJSONResponse = async <R>(response: Response): Promise<R> => {
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

export const fetchUiProxy = async (
  endpoint: string,
  serviceUrl: string,
  applyOptions: (options: RequestInit) => RequestInit,
  requestInit: RequestInit,
): Promise<Response> => {
  const options = applyOptions(requestInit);

  return await fetch(`${serviceUrl}/api/${endpoint}`, options);
};

const putOrPostData = async <TRequest, TResponse = TRequest>(
  kind: string,
  data: TRequest,
  serviceUrl: string,
  applyOptions: (options: RequestInit) => RequestInit,
  method: 'PUT' | 'POST',
): Promise<TResponse> => {
  const options: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
    },
    method,
    body: JSON.stringify(data),
  };
  const updatedOptions = applyOptions(options);
  try {
    const response = await fetch(`${serviceUrl}/api/v1/${kind}`, updatedOptions);
    return handleApiJSONResponse(response);
  } catch (error) {
    console.error(`Error making ${method} request for ${kind}:`, error);
    throw error;
  }
};

export const postData = async <TRequest, TResponse = TRequest>(
  kind: string,
  data: TRequest,
  serviceUrl: string,
  applyOptions: (options: RequestInit) => RequestInit,
): Promise<TResponse> => putOrPostData<TRequest, TResponse>(kind, data, serviceUrl, applyOptions, 'POST');

export const putData = async <TRequest>(
  kind: string,
  data: TRequest,
  serviceUrl: string,
  applyOptions: (options: RequestInit) => RequestInit,
): Promise<TRequest> => putOrPostData<TRequest, TRequest>(kind, data, serviceUrl, applyOptions, 'PUT');

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
  const updatedOptions = applyOptions(options);
  try {
    const response = await fetch(`${serviceUrl}/api/v1/${kind}`, updatedOptions);
    return handleApiJSONResponse(response);
  } catch (error) {
    console.error('Error making DELETE request:', error);
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
  const updatedOptions = applyOptions(options);
  try {
    const response = await fetch(`${serviceUrl}/api/v1/${kind}`, updatedOptions);
    return handleApiJSONResponse(response);
  } catch (error) {
    console.error('Error making PATCH request:', error);
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
    console.error('Error making GET request:', error);
    throw error;
  }
};
