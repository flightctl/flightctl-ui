import * as React from 'react';
import { useTableTextSearch } from '@app/hooks/useTableTextSearch';
import { ApprovalStatus, getApprovalStatus } from '@app/utils/status/enrollmentRequest';
import { Device, EnrollmentRequest } from '@types';

export const isEnrollmentRequest = (resource: Device | EnrollmentRequest): resource is EnrollmentRequest =>
  resource.kind === 'EnrollmentRequest';

const getSearchText = (resource: Device | EnrollmentRequest) => [
  resource.metadata.name,
  resource.metadata.labels?.displayName,
];

export const useDeviceFilters = (resources: Array<Device | EnrollmentRequest>, queryFilters) => {
  const [filters, setFilters] = React.useState<{ status: ApprovalStatus[] }>({
    status: [],
  });
  const [fleetName, setFleetName] = React.useState<string>(queryFilters.filterByFleetId);

  const fData = React.useMemo(
    () =>
      resources.filter((resource) => {
        if (!filters.status.length) {
          return true;
        }
        return filters.status.includes(
          isEnrollmentRequest(resource) ? getApprovalStatus(resource) : ApprovalStatus.Approved,
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
