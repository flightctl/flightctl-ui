import * as React from 'react';
import { Device /*, DeviceWorkloadSummaryType*/, EnrollmentRequest } from '@flightctl/types';

import { useTableTextSearch } from '../../hooks/useTableTextSearch';
import { isEnrollmentRequest } from '../../types/extraTypes';
import { getDeviceStatus } from '../../utils/status/device';
import { CurrentStatusIds, FilterSearchParams } from '../../utils/status/devices';

const getSearchText = (resource: Device | EnrollmentRequest) => [
  resource.metadata.name,
  resource.metadata.labels?.displayName,
];

const validCurrentStatuses = Object.values(CurrentStatusIds) as string[];
// const validAppStatuses = Object.values(DeviceWorkloadSummaryType) as string[];

export const useDeviceFilters = (resources: Array<Device | EnrollmentRequest>, searchParams: URLSearchParams) => {
  const fleetId = searchParams.get(FilterSearchParams.Fleet) || undefined;
  const searchParamValue = searchParams.toString();
  const [fleetName, setFleetName] = React.useState<string | undefined>(fleetId);

  const statuses = React.useMemo(() => {
    const statuses: string[] = [];
    const currentStatuses = searchParams.getAll(FilterSearchParams.Current) || [];
    currentStatuses.forEach((status) => {
      if (validCurrentStatuses.includes(status)) {
        statuses.push(`${FilterSearchParams.Current}#${status}`);
      }
    });
    // TODO do the same for the other statuses
    // const appStatuses = searchParams.getAll(FilterSearchParams.App) || [];
    // appStatuses.forEach((status) => {
    //   if (validAppStatuses.includes(status)) {
    //     statuses.push(`${FilterSearchParams.App}#${status}`);
    //   }
    // });

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
          return statuses.includes(`${FilterSearchParams.Current}#Pending`);
        }

        const deviceStatus = getDeviceStatus(resource);
        return statuses.includes(`${FilterSearchParams.Current}#${deviceStatus}`);
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
