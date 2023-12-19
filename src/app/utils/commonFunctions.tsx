
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
export const approveEnrollmentRequest = async (name: string, token: string) => {
try {
    axios.defaults.headers.common['Authorization'] = 'Bearer ' + token;
    const response = await axios.put(apiServer + '/api/v1/enrollmentrequests/' + name + '/approval');
    return response.data;
  } catch (error) {
    console.error('Error making request:', error);
  }
}

export const rejectEnrollmentRequest = async (name: string, token: string) => {
try {
    axios.defaults.headers.common['Authorization'] = 'Bearer ' + token;
    const response = await axios.put(apiServer + '/api/v1/enrollmentrequests/' + name + '/rejection');
    return response.data;
  } catch (error) {
    console.error('Error making request:', error);
  }
}

export const tableCellData = (column, obj) => {
  const columnKey = column.key.split('.');
  let finalKey = obj;
  if (columnKey.length > 1) {
    columnKey.forEach((key) => {
      // if key ends with [NUMBER] then it is an array of objects
      if (key.match(/\[\d+\]/)) {
        const arrayKey = key.split('[');
        const arrayIndex = arrayKey[1].replace(']', '');
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