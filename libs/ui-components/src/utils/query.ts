import { FlightCtlLabel } from '../types/extraTypes';
import { labelToExactApiMatchString } from './labels';

const addQueryConditions = (fieldSelectors: string[], fieldSelector: string, values?: string[]) => {
  if (values?.length === 1) {
    fieldSelectors.push(`${fieldSelector}=${values[0]}`);
  } else if (values?.length) {
    fieldSelectors.push(`${fieldSelector} in (${values.join(',')})`);
  }
};

const addTextContainsCondition = (fieldSelectors: string[], fieldSelector: string, value: string) => {
  fieldSelectors.push(`${fieldSelector} contains ${value}`); // contains operator
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

type CommonQueryOptions = {
  limit: number | undefined;
};

export const commonQueries = {
  // We can't specify a sorting, as every entity has a default sorting which is always applied implicitly.
  getDevicesWithExactLabelMatching: (labels: FlightCtlLabel[], options?: CommonQueryOptions) => {
    const searchParams = new URLSearchParams();

    // By default (without the "equal" sign), the API returns a partial match, but only on the label keys
    // To prevent this confusing behaviour, we query for exact matches in all cases (for both keys and values)
    const exactLabelsMatch = labels.map(labelToExactApiMatchString).join(',');
    searchParams.set('labelSelector', exactLabelsMatch);

    if (options?.limit) {
      searchParams.set('limit', `${options.limit}`);
    }
    return `devices?${searchParams.toString()}`;
  },
  getFleetsWithNameMatching: (matchName: string, options?: CommonQueryOptions) => {
    const searchParams = new URLSearchParams();
    searchParams.set('fieldSelector', `metadata.name contains ${matchName}`);

    if (options?.limit) {
      searchParams.set('limit', `${options.limit}`);
    }
    return `fleets?${searchParams.toString()}`;
  },
  getResourceSyncsByRepo: (repositoryId: string, options?: CommonQueryOptions) => {
    const searchParams = new URLSearchParams();
    searchParams.set('fieldSelector', `spec.repository=${repositoryId}`);

    if (options?.limit) {
      searchParams.set('limit', `${options.limit}`);
    }
    return `resourcesyncs?${searchParams.toString()}`;
  },
  getRepositoryById: (repositoryId: string) => `repositories/${repositoryId}`,
};

export { addQueryConditions, addTextContainsCondition, setLabelParams };
