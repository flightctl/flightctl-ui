import * as React from 'react';
import { useDebounce } from 'use-debounce';

import { Fleet, FleetList } from '@flightctl/types';
import { useAppContext } from '../../hooks/useAppContext';
import { useFetchPeriodically } from '../../hooks/useFetchPeriodically';
import { PaginationDetails, useTablePagination } from '../../hooks/useTablePagination';
import { PAGE_SIZE } from '../../constants';

export enum FleetSearchParams {
  Name = 'name',
}

type FleetsEndpointArgs = {
  name?: string;
  nextContinue?: string;
  addDevicesCount?: boolean;
};

export const useFleetBackendFilters = () => {
  const {
    router: { useSearchParams },
  } = useAppContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const paramsRef = React.useRef(searchParams);
  const name = searchParams.get(FleetSearchParams.Name) || undefined;

  const setName = React.useCallback(
    (nameVal: string) => {
      const newParams = new URLSearchParams({
        [FleetSearchParams.Name]: nameVal,
      });
      paramsRef.current = newParams;
      setSearchParams(newParams);
    },
    [setSearchParams],
  );

  const hasFiltersEnabled = !!name;

  return {
    name,
    setName,
    hasFiltersEnabled,
  };
};

const getFleetsEndpoint = ({
  name,
  addDevicesCount,
  nextContinue,
}: {
  name?: string;
  addDevicesCount?: boolean;
  nextContinue?: string;
}) => {
  const params = new URLSearchParams({
    limit: `${PAGE_SIZE}`,
  });
  if (name) {
    params.set('fieldSelector', `metadata.name contains ${name}`);
  }
  if (addDevicesCount) {
    params.set('addDevicesCount', 'true');
  }
  if (nextContinue) {
    params.set('continue', nextContinue);
  }
  return `fleets?${params.toString()}`;
};

const useFleetsEndpoint = (args: FleetsEndpointArgs): [string, boolean] => {
  const endpoint = getFleetsEndpoint(args);
  const [fleetsEndpointDebounced] = useDebounce(endpoint, 1000);
  return [fleetsEndpointDebounced, endpoint !== fleetsEndpointDebounced];
};

export type FleetLoad = {
  fleets: Fleet[];
  isLoading: boolean;
  error: unknown;
  isUpdating: boolean;
  refetch: VoidFunction;
  pagination: PaginationDetails;
};

export const useFleets = (args: FleetsEndpointArgs): FleetLoad => {
  const pagination = useTablePagination();
  const [fleetsEndpoint, fleetsDebouncing] = useFleetsEndpoint({ ...args, nextContinue: pagination.nextContinue });
  const [fleetsList, isLoading, error, refetch, updating] = useFetchPeriodically<FleetList>(
    {
      endpoint: fleetsEndpoint,
    },
    pagination.onPageFetched,
  );
  return {
    fleets: fleetsList?.items || [],
    isLoading,
    error,
    isUpdating: updating || fleetsDebouncing,
    refetch,
    pagination,
  };
};
