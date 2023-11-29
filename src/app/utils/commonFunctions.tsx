
import axios from 'axios';
var apiServer = "";
if (process.env.NODE_ENV === 'development') {
  apiServer = window.location.protocol + '//' + window.location.hostname + ":" + process.env.API_PORT;
} 

export const fetchData = async (kind: string) => {
    try {
        const response = await axios.get(apiServer + '/api/v1/' + kind);
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error('Error making request:', error);
    }
}
export const deleteObject = async (kind: string, name: string) => {
    try {
        const response = await axios.delete(apiServer + '/api/v1/' + kind + '/' + name);
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error('Error making request:', error);
    }
}
export const approveEnrollmentRequest = async (name: string) => {
    try {
        const response = await axios.put(apiServer + '/api/v1/enrollmentrequests/' + name + '/approve');
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error('Error making request:', error);
    }
}

export const tableCellData = (column, fleet) => {
    const columnKey = column.key.split('.');
    let finalKey = fleet;
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
      finalKey = fleet[column.key];
    }
    const data = column.formatter ? column.formatter(finalKey) : finalKey;

    if (data === undefined) {
      return '-';
    }
    return data;
  };