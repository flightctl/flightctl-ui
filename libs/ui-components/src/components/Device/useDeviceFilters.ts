import * as React from 'react';
import {
  Device,
  DeviceSystemSummaryStatusType,
  DeviceUpdateStatusType,
  DeviceWorkloadSummaryType,
  EnrollmentRequest,
} from '@flightctl/types';

import { useTableTextSearch } from '../../hooks/useTableTextSearch';
import { isEnrollmentRequest } from '../../types/extraTypes';
import { getDeviceStatus } from '../../utils/status/device';
import { FilterSearchParams } from '../../utils/status/devices';

const getSearchText = (resource: Device | EnrollmentRequest) => [
  resource.metadata.name,
  resource.metadata.labels?.displayName,
];

const validDeviceStatuses = Object.values(DeviceSystemSummaryStatusType) as string[];
const validAppStatuses = Object.values(DeviceWorkloadSummaryType) as string[];
const validUpdateStatuses = Object.values(DeviceUpdateStatusType) as string[];

export const useDeviceFilters = (resources: Array<Device | EnrollmentRequest>, searchParams: URLSearchParams) => {
  const fleetId = searchParams.get(FilterSearchParams.Fleet) || undefined;
  const searchParamValue = searchParams.toString();
  const [fleetName, setFleetName] = React.useState<string | undefined>(fleetId);

  const statuses = React.useMemo(() => {
    const statuses: string[] = [];
    const deviceStatuses = searchParams.getAll(FilterSearchParams.Device) || [];
    deviceStatuses.forEach((status) => {
      if (validDeviceStatuses.includes(status)) {
        statuses.push(`${FilterSearchParams.Device}#${status}`);
      }
    });
    const appStatuses = searchParams.getAll(FilterSearchParams.App) || [];
    appStatuses.forEach((status) => {
      if (validAppStatuses.includes(status)) {
        statuses.push(`${FilterSearchParams.App}#${status}`);
      }
    });

    const updateStatuses = searchParams.getAll(FilterSearchParams.Update) || [];
    updateStatuses.forEach((status) => {
      if (validUpdateStatuses.includes(status)) {
        statuses.push(`${FilterSearchParams.Update}#${status}`);
      }
    });

    return statuses;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParamValue]);

  const fData = React.useMemo(
    () =>
      resources.filter((resource) => {
        if (!statuses.length) {
          return true;
        }
        if (isEnrollmentRequest(resource)) {
          return statuses.includes(`${FilterSearchParams.Device}#Pending`);
        }

        const deviceStatus = getDeviceStatus(resource);
        return statuses.includes(`${FilterSearchParams.Device}#${deviceStatus}`);
      }),
    [resources, statuses],
  );

  const { search, setSearch, filteredData } = useTableTextSearch(fData, getSearchText);

  return {
    filteredData,
    filters: {
      statuses,
    },
    fleetName,
    setFleetName,
    search,
    setSearch,
  };
};
