import { useTableTextSearch } from '@app/hooks/useTableTextSearch';
import { ApprovalStatus, getApprovalStatus } from '@app/utils/status/enrollmentRequest';
import { EnrollmentRequest } from '@types';
import * as React from 'react';

const getSearchText = (er: EnrollmentRequest) => [er.metadata.name];

export const useERFilters = (enrollmentRequests: EnrollmentRequest[]) => {
  const [filters, setFilters] = React.useState<{ status: ApprovalStatus[] }>({
    status: [ApprovalStatus.Pending],
  });

  const fData = React.useMemo(
    () =>
      enrollmentRequests.filter((er) => {
        if (!filters.status.length) {
          return true;
        }
        return filters.status.includes(getApprovalStatus(er));
      }),
    [enrollmentRequests, filters]
  );

  const { search, setSearch, filteredData } = useTableTextSearch(fData, getSearchText);

  return {
    filteredData,
    search,
    setSearch,
    filters,
    setFilters,
  };
};
