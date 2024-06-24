import * as React from 'react';
import { useTableTextSearch } from '../../hooks/useTableTextSearch';
import { ApprovalStatus, getApprovalStatus } from '../../utils/status/enrollmentRequest';
import { DeviceConditionStatus, getDeviceStatus } from '../../utils/status/device';
import { Device, EnrollmentRequest } from '@flightctl/types';
import { isEnrollmentRequest } from '../../types/extraTypes';

const getSearchText = (resource: Device | EnrollmentRequest) => [
  resource.metadata.name,
  resource.metadata.labels?.displayName,
];

export const useDeviceFilters = (
  resources: Array<Device | EnrollmentRequest>,
  queryFilters: { filterByFleetId: string | undefined },
) => {
  const [filters, setFilters] = React.useState<{ status: Array<DeviceConditionStatus | ApprovalStatus> }>({
    status: [],
  });
  const [fleetName, setFleetName] = React.useState<string | undefined>(queryFilters.filterByFleetId);

  const fData = React.useMemo(
    () =>
      resources.filter((resource) => {
        if (!filters.status.length) {
          return true;
        }
        return filters.status.includes(
          isEnrollmentRequest(resource) ? getApprovalStatus(resource) : getDeviceStatus(resource),
        );
      }),
    [resources, filters],
  );

  const { search, setSearch, filteredData } = useTableTextSearch(fData, getSearchText);

  return {
    filteredData,
    fleetName,
    setFleetName,
    search,
    setSearch,
    filters,
    setFilters,
  };
};
