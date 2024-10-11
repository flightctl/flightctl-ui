import { FlightCtlLabel } from '../types/extraTypes';

const addQueryConditions = (fieldSelectors: string[], fieldSelector: string, values?: string[]) => {
  if (values?.length === 1) {
    fieldSelectors.push(`${fieldSelector}=${values[0]}`);
  } else if (values?.length) {
    fieldSelectors.push(`${fieldSelector} in (${values.join(',')})`);
  }
};

const setLabelParams = (params: URLSearchParams, labels?: FlightCtlLabel[]) => {
  if (labels?.length) {
    const labelSelector = labels.reduce((acc, curr) => {
      if (!acc) {
        acc = `${curr.key}=${curr.value || ''}`;
      } else {
        acc += `,${curr.key}=${curr.value || ''}`;
      }
      return acc;
    }, '');
    params.append('labelSelector', labelSelector);
  }
};

export { addQueryConditions, setLabelParams };
