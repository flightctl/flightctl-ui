const apiServer = `${window.location.protocol}//${window.location.hostname}${window.API_PORT ? `:${window.API_PORT}` : ''}`;

const flightCtlAPI = `${apiServer}/api/flightctl`;
const metricsAPI = `${apiServer}/api/metrics`;

export const fetchMetrics = async (metricQuery: string, token: string | undefined, abortSignal?: AbortSignal) => {
  try {
    const response = await fetch(`${metricsAPI}/api/v1/query_range?${metricQuery}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      signal: abortSignal,
    });

    const resp = await response.json();
    return resp.data.result;
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
    const resp = await response.json();
    return resp;
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
    const resp = await response.json();
    return resp;
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
    const resp = await response.json();
    return resp;
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
    const data = await response.json();
    return data;
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
      const data = await response.json();
      return data;
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
    const data = await response.json();
    return data;
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
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error making request:', error);
    return error;
  }
};
export const enableRCAgent = async (name: string | undefined, token: string | undefined) => {
  try {
    const response = await fetch(`${apiServer}/api/v1/rcagent/${name}/enable`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error making request:', error);
  }
};
