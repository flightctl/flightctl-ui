import * as React from 'react';
import {
  ApplicationsSummaryStatusType as AppStatus,
  Device,
  DeviceSummaryStatusType as DeviceStatus,
  EnrollmentRequest,
  DeviceUpdatedStatusType as UpdatedStatus,
} from '@flightctl/types';

import { useTableTextSearch } from '../../hooks/useTableTextSearch';
import { isEnrollmentRequest } from '../../types/extraTypes';
import { getDeviceSummaryStatus } from '../../utils/status/devices';
import { getApprovalStatus } from '../../utils/status/enrollmentRequest';
import { EnrollmentRequestStatus, FilterSearchParams } from '../../utils/status/common';

const getSearchText = (resource: Device | EnrollmentRequest) => [
  resource.metadata.name,
  resource.metadata.labels?.displayName,
];

const validAppStatuses = Object.values(AppStatus) as string[];
const validUpdatedStatuses = Object.values(UpdatedStatus) as string[];
const validDeviceStatuses = Object.values(DeviceStatus) as string[];
validDeviceStatuses.push(EnrollmentRequestStatus.Pending);

export const useDeviceFilters = (resources: Array<Device | EnrollmentRequest>, searchParams: URLSearchParams) => {
  const fleetId = searchParams.get(FilterSearchParams.Fleet) || undefined;
  const searchParamValue = searchParams.toString();
  const [fleetName, setFleetName] = React.useState<string | undefined>(fleetId);

  const statuses = React.useMemo(() => {
    const statuses: string[] = [];
    const deviceStatuses = searchParams.getAll(FilterSearchParams.DeviceStatus) || [];
    deviceStatuses.forEach((status) => {
      if (validDeviceStatuses.includes(status)) {
        statuses.push(`${FilterSearchParams.DeviceStatus}#${status}`);
      }
    });
    const appStatuses = searchParams.getAll(FilterSearchParams.AppStatus) || [];
    appStatuses.forEach((status) => {
      if (validAppStatuses.includes(status)) {
        statuses.push(`${FilterSearchParams.AppStatus}#${status}`);
      }
    });

    const updateStatuses = searchParams.getAll(FilterSearchParams.UpdatedStatus) || [];
    updateStatuses.forEach((status) => {
      if (validUpdatedStatuses.includes(status)) {
        statuses.push(`${FilterSearchParams.UpdatedStatus}#${status}`);
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
          const status = getApprovalStatus(resource);
          return (
            status === EnrollmentRequestStatus.Pending &&
            statuses.includes(`${FilterSearchParams.DeviceStatus}#Pending`)
          );
        }

        const deviceStatus = getDeviceSummaryStatus(resource.status);
        return statuses.includes(`${FilterSearchParams.DeviceStatus}#${deviceStatus}`);
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
