
import axios from 'axios';
var apiServer = "";
if (process.env.NODE_ENV === 'development') {
  apiServer = window.location.protocol + '//' + window.location.hostname + ":" + process.env.API_PORT;
}

export const fetchData = async (kind: string, token: string) => {
  try {
    axios.defaults.headers.common['Authorization'] = 'Bearer ' + token;
    const response = await axios.get(apiServer + '/api/v1/' + kind);
    return response.data;
  } catch (error) {
    console.error('Error making request:', error);
  }
}

export const fetchDataObj = async (kind: string, name: string, token: string) => {
  if (kind !== undefined && name !== undefined) {
    try {
      axios.defaults.headers.common['Authorization'] = 'Bearer ' + token;
      const response = await axios.get(apiServer + '/api/v1/' + kind + '/' + name);
      return response.data;
    } catch (error) {
      console.error('Error making request:', error);
    }
  } else {
    console.error('Error making request: invalid kind or name');
  }
}

export const deleteObject = async (kind: string, name: string, token: string) => {
  try {
    axios.defaults.headers.common['Authorization'] = 'Bearer ' + token;
    const response = await axios.delete(apiServer + '/api/v1/' + kind + '/' + name);
    return response.data;
  } catch (error) {
    console.error('Error making request:', error);
  }
}
export const approveEnrollmentRequest = async (name: string, data: object, token: string) => {
try {
    axios.defaults.headers.common['Authorization'] = 'Bearer ' + token;
    const response = await axios.post(apiServer + '/api/v1/enrollmentrequests/' + name + '/approval', data);
    return response;
  } catch (error: any) {
    console.log(error.response.status)
    console.error('Error making request:', error);
    return error.response;
  }
}

export const rejectEnrollmentRequest = async (name: string, token: string) => {
try {
    axios.defaults.headers.common['Authorization'] = 'Bearer ' + token;
    const response = await axios.post(apiServer + '/api/v1/enrollmentrequests/' + name + '/rejection');
    return response.data;
  } catch (error) {
    console.error('Error making request:', error);
    return error;
  }
}
export const enableRCAgent = async (name: string, token: string) => {
  try {
    axios.defaults.headers.common['Authorization'] = 'Bearer ' + token;
    const response = await axios.post(apiServer + '/api/v1/device/' + name + '/remotecontrol/enable');
    return response.data;
  }
  catch (error) {
    console.error('Error making request:', error);
  }
}

export const tableCellData = (column, obj) => {
  const columnKey = column.key.split('.');
  let finalKey = obj;
  if (column.key === "metadata.labels") {
    // If the column is metadata.labels then we need to iterate through the labels and display them
    const labels = obj.metadata.labels;
    let labelString = "";
    for (const [key, value] of Object.entries(labels)) {
      labelString += key + "=" + value + ", ";
    }
    if (labelString.length > 0) {
      labelString = labelString.slice(0, -2);
    } else {
      labelString = "-";
    }
    return labelString;
  } else if (columnKey.length > 1) {
    columnKey.forEach((key) => {
      // if key ends with [NUMBER] then it is an array of objects
      if (key.match(/\[\d+\]/)) {
        const arrayKey = key.split('[');
        const arrayIndex = arrayKey[1].replace(']', '');
        if (finalKey[arrayKey[0]] === undefined) {
          return '-';
        }
        finalKey = finalKey[arrayKey[0]][arrayIndex];
        return finalKey;
      }
      if (finalKey === undefined) {
        return '-';
      }
      finalKey = finalKey[key];
    });
  } else {
    finalKey = obj[column.key];
  }
  const data = column.formatter ? column.formatter(finalKey) : finalKey;
  if (data === undefined) {
    return '-';
  }
  return data;
};