import * as React from 'react';

import { useDebounce } from 'use-debounce';

import { EnrollmentRequest, EnrollmentRequestList } from '@flightctl/types';

import { useFetchPeriodically } from '../../hooks/useFetchPeriodically';
import { PaginationDetails, useTablePagination } from '../../hooks/useTablePagination';

import { PAGE_SIZE } from '../../constants';

type EnrollmentRequestsEndpointArgs = {
  nextContinue?: string;
};

const getPendingEnrollmentsEndpoint = ({ nextContinue }: EnrollmentRequestsEndpointArgs) => {
  const params = new URLSearchParams({
    fieldSelector: '!status.approval.approved',
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

export const usePendingEnrollments = (): [
  EnrollmentRequest[],
  boolean,
  unknown,
  VoidFunction,
  pagination: Pick<PaginationDetails, 'currentPage' | 'setCurrentPage' | 'itemCount'>,
] => {
  const { currentPage, setCurrentPage, itemCount, nextContinue, onPageFetched } = useTablePagination();
  const [pendingErEndpoint, isDebouncing] = useEnrollmentRequestsEndpoint({ nextContinue });

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
