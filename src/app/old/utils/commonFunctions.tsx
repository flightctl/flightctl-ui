const apiServer = `${window.location.protocol}//${window.location.hostname}${window.API_PORT ? `:${window.API_PORT}` : ''}`;

const flightCtlAPI = `${apiServer}/api/flightctl`;
const metricsAPI = `${apiServer}/api/metrics`;

const handleApiJSONResponse = async (response) => {
  if (response.ok) {
    const data = await response.json();
    return data;
  }

  if (response.status === 404) {
    // We skip the response message for 404 errors, which is { message: '' }
    throw new Error(`Error ${response.status}: ${response.statusText}`)
  }

  let errorText;
  try {
    const json = await response.json();
    errorText = ` - ${json.message || json}`;
  } catch (e) {
    // ignore
  }
  throw new Error(`Error ${response.status}: ${response.statusText}${errorText}`)
}

export const fetchMetrics = async (metricQuery: string, token: string | undefined, abortSignal?: AbortSignal) => {
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

export const postData = async (kind: string, token: string | undefined, data: unknown) => {
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

export const putData = async (kind: string, token: string | undefined, data: unknown) => {
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

export const deleteData = async (kind: string, token: string | undefined) => {
  try {
    const response = await fetch(`${flightCtlAPI}/api/v1/${kind}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      method: 'DELETE',
    });
    return handleApiJSONResponse(response);
  } catch (error) {
    console.error('Error making request:', error);
    throw error;
  }
};

export const fetchData = async (kind: string, token: string | undefined, abortSignal?: AbortSignal) => {
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

export const fetchDataObj = async (kind: string, name: string, token: string) => {
  if (kind !== undefined && name !== undefined) {
    try {
      const response = await fetch(`${flightCtlAPI}/api/v1/${kind}/${name}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return handleApiJSONResponse(response);
    } catch (error) {
      console.error('Error making request:', error);
    }
  } else {
    console.error('Error making request: invalid kind or name');
  }
};

export const deleteObject = async (kind: string, name: string, token: string) => {
  try {
    const response = await fetch(`${flightCtlAPI}/api/v1/${kind}/${name}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return handleApiJSONResponse(response);
  } catch (error) {
    console.error('Error making request:', error);
  }
};
export const approveEnrollmentRequest = async (name: string, data: object, token: string) => {
  try {
    const response = await fetch(`${flightCtlAPI}/api/v1/enrollmentrequests/${name}/approval`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return response;
  } catch (error: any) {
    console.log(error.response.status);
    console.error('Error making request:', error);
    return error.response;
  }
};

export const rejectEnrollmentRequest = async (name: string, token: string) => {
  try {
    const response = await fetch(`${flightCtlAPI}/api/v1/enrollmentrequests/${name}/rejection`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return handleApiJSONResponse(response);
  } catch (error) {
    console.error('Error making request:', error);
    return error;
  }
};
