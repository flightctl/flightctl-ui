
import axios from 'axios';
export const fetchData = async (kind: string) => {
    try {
        const response = await axios.get('http://localhost:3001/api/v1/' + kind);
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