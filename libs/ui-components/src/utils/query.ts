import { FlightCtlLabel } from '../types/extraTypes';
import { labelToExactApiMatchString, textToPartialApiMatchString } from './labels';
import { DeviceSummaryStatusType } from '@flightctl/types';

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
  getDevicesWithExactLabelMatching: (labels: FlightCtlLabel[], options?: CommonQueryOptions) => {
    const searchParams = new URLSearchParams();

    const exactLabelsMatch = labels.map(labelToExactApiMatchString).join(',');
    searchParams.set('labelSelector', exactLabelsMatch);

    if (options?.limit) {
      searchParams.set('limit', `${options.limit}`);
    }
    return `devices?${searchParams.toString()}`;
  },
  getDevicesWithPartialLabelMatching: (text: string, options?: CommonQueryOptions) => {
    const searchParams = new URLSearchParams({
      kind: 'Device',
    });

    searchParams.set('fieldSelector', textToPartialApiMatchString(text));

    if (options?.limit) {
      searchParams.set('limit', `${options.limit}`);
    }
    return `labels?${searchParams.toString()}`;
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
  getSuspendedDeviceCountByLabels: (labels: FlightCtlLabel[]) => {
    const searchParams = new URLSearchParams({
      limit: '1',
    });
    searchParams.set('labelSelector', labels.map(labelToExactApiMatchString).join(','));
    searchParams.set(
      'fieldSelector',
      `status.summary.status=${DeviceSummaryStatusType.DeviceSummaryStatusConflictPaused}`,
    );
    return `devices?${searchParams.toString()}`;
  },
  getAllSuspendedDevicesCount: () => {
    const searchParams = new URLSearchParams({
      limit: '1',
    });
    searchParams.set(
      'fieldSelector',
      `status.summary.status=${DeviceSummaryStatusType.DeviceSummaryStatusConflictPaused}`,
    );
    return `devices?${searchParams.toString()}`;
  },
};

export { addQueryConditions, addTextContainsCondition, setLabelParams };
