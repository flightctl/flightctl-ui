import { DeviceSummaryStatusType } from '@flightctl/types';

import { FlightCtlLabel } from '../types/extraTypes';
import { labelToExactApiMatchString, textToPartialApiMatchString } from './labels';
import {
  DEVICE_OS_MODE_FILTER_VALUES,
  type DeviceOsModeFilterValue,
  KNOWN_OS_MODE_FILTER_VALUES,
  UNKNOWN_CAPABILITY_VALUE,
} from './status/devices';

const OS_MODE_FIELD = 'status.capabilities.osMode';

const addQueryConditions = (fieldSelectors: string[], fieldSelector: string, values?: string[]) => {
  if (values?.length === 1) {
    fieldSelectors.push(`${fieldSelector}=${values[0]}`);
  } else if (values?.length) {
    fieldSelectors.push(`${fieldSelector} in (${values.join(',')})`);
  }
};

/**
 * Builds fieldSelector conditions for OS mode, that accepts up to 3 values: image/package/unknown(unset value).
 */
const addOsModeQueryConditions = (fieldSelectors: string[], selectedOsModes?: DeviceOsModeFilterValue[]) => {
  const uniqueSelectedOsModes = [...new Set(selectedOsModes ?? [])];
  if (!uniqueSelectedOsModes?.length || uniqueSelectedOsModes.length === DEVICE_OS_MODE_FILTER_VALUES.length) {
    return;
  }

  const includeUnknown = uniqueSelectedOsModes.includes(UNKNOWN_CAPABILITY_VALUE);
  const selectedKnownOsMode = uniqueSelectedOsModes.filter((mode) => mode !== UNKNOWN_CAPABILITY_VALUE);
  const excludedOsMode =
    selectedKnownOsMode.length === 1
      ? KNOWN_OS_MODE_FILTER_VALUES.find((mode) => mode !== selectedKnownOsMode[0])
      : undefined;

  if (includeUnknown) {
    if (selectedKnownOsMode.length === 0) {
      // List only devices that did not report their OS mode
      fieldSelectors.push(`!${OS_MODE_FIELD}`);
    } else {
      // List only devices that don't match the excluded osMode.
      fieldSelectors.push(`${OS_MODE_FIELD}!=${excludedOsMode}`);
    }
    return;
  }

  if (selectedKnownOsMode.length === 1) {
    // List only devices that match the selected osMode.
    fieldSelectors.push(`${OS_MODE_FIELD}=${selectedKnownOsMode[0]}`);
  } else {
    // List only devices that have an OS mode (the only unselected osMode is "unknown").
    fieldSelectors.push(`${OS_MODE_FIELD}`);
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
  getResourceSyncsByRepo: ({
    repositoryId,
    rsName,
    options,
  }: {
    repositoryId: string;
    rsName?: string;
    options?: CommonQueryOptions;
  }) => {
    const selectors: string[] = [`spec.repository=${repositoryId}`];
    if (rsName) {
      selectors.push(`metadata.name contains ${rsName}`);
    }

    const searchParams = new URLSearchParams();
    searchParams.set('fieldSelector', selectors.join(','));
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

export { addQueryConditions, addOsModeQueryConditions, addTextContainsCondition, setLabelParams };
