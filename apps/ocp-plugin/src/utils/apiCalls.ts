/* eslint-disable no-console */

const apiServer = `${window.location.protocol}//${window.location.hostname}:9000/api/proxy/plugin/flightctl-plugin`;

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

export const fetchMetrics = async <R>(
  metricQuery: string,
  token: string | undefined,
  abortSignal?: AbortSignal,
): Promise<R> => {
  try {
    const response = await fetch(`${metricsAPI}/api/v1/query_range?${metricQuery}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      signal: abortSignal,
    });
    return handleApiJSONResponse(response);
  } catch (error) {
    console.error('Error making request:', error);
    throw error;
  }
};

export const postData = async <R>(kind: string, token: string | undefined, data: R): Promise<R> => {
  try {
    const response = await fetch(`${flightCtlAPI}/api/v1/${kind}`, {
      headers: {
        Authorization: `Bearer ${token}`,
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

export const putData = async <R>(kind: string, token: string | undefined, data: R): Promise<R> => {
  try {
    const response = await fetch(`${flightCtlAPI}/api/v1/${kind}`, {
      headers: {
        Authorization: `Bearer ${token}`,
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

export const deleteData = async <R>(kind: string, token: string | undefined, abortSignal?: AbortSignal): Promise<R> => {
  try {
    const response = await fetch(`${flightCtlAPI}/api/v1/${kind}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      method: 'DELETE',
      signal: abortSignal,
    });
    return handleApiJSONResponse(response);
  } catch (error) {
    console.error('Error making request:', error);
    throw error;
  }
};

export const fetchData = async <R>(kind: string, token: string | undefined, abortSignal?: AbortSignal): Promise<R> => {
  try {
    const response = await fetch(`${flightCtlAPI}/api/v1/${kind}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      signal: abortSignal,
    });
    return handleApiJSONResponse(response);
  } catch (error) {
    console.error('Error making request:', error);
    throw error;
  }
};
