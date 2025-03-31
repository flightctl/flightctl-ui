import * as React from 'react';

import { useDebounce } from 'use-debounce';

import { EnrollmentRequest, EnrollmentRequestList } from '@flightctl/types';

import { useFetchPeriodically } from '../../hooks/useFetchPeriodically';
import { PaginationDetails, useTablePagination } from '../../hooks/useTablePagination';

import { PAGE_SIZE } from '../../constants';

type EnrollmentRequestsEndpointArgs = {
  search?: string;
  nextContinue?: string;
};

const getPendingEnrollmentsEndpoint = ({ search, nextContinue }: EnrollmentRequestsEndpointArgs) => {
  const fieldSelector = ['!status.approval.approved'];
  if (search) {
    fieldSelector.push(`metadata.name contains ${search}`);
  }

  const params = new URLSearchParams({
    fieldSelector: fieldSelector.join(','),
  });

  if (nextContinue !== undefined) {
    params.set('limit', `${PAGE_SIZE}`);
  }
  if (nextContinue) {
    params.set('continue', nextContinue);
  }
  return `enrollmentrequests?${params.toString()}`;
};

export const useEnrollmentRequestsEndpoint = (args: EnrollmentRequestsEndpointArgs): [string, boolean] => {
  const endpoint = getPendingEnrollmentsEndpoint(args);
  const [pendingErEndpointDebounced] = useDebounce(endpoint, 1000);
  return [pendingErEndpointDebounced, endpoint !== pendingErEndpointDebounced];
};

export const usePendingEnrollments = (
  search?: string,
): [
  EnrollmentRequest[],
  boolean,
  unknown,
  VoidFunction,
  pagination: Pick<PaginationDetails<EnrollmentRequestList>, 'currentPage' | 'setCurrentPage' | 'itemCount'>,
] => {
  const { currentPage, setCurrentPage, itemCount, nextContinue, onPageFetched } =
    useTablePagination<EnrollmentRequestList>();
  const [pendingErEndpoint, isDebouncing] = useEnrollmentRequestsEndpoint({ search, nextContinue });

  const [erList, isLoading, error, refetch] = useFetchPeriodically<EnrollmentRequestList>(
    {
      endpoint: pendingErEndpoint,
    },
    onPageFetched,
  );

  const pagination = React.useMemo(
    () => ({
      currentPage,
      setCurrentPage,
      itemCount,
    }),
    [currentPage, setCurrentPage, itemCount],
  );

  return [erList?.items || [], isLoading || isDebouncing, error, refetch, pagination];
};
