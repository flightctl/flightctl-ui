import * as React from 'react';
import { useDebounce } from 'use-debounce';

import { type Fleet, type FleetList } from '@flightctl/types';
import { useAppContext } from '../../hooks/useAppContext';
import { useFetchPeriodically } from '../../hooks/useFetchPeriodically';
import { type PaginationDetails, useTablePagination } from '../../hooks/useTablePagination';
import { PAGE_SIZE } from '../../constants';

export enum FleetSearchParams {
  Name = 'name',
}

type FleetsEndpointArgs = {
  name?: string;
  /** When true, retrieve only fleets not managed by a resource sync. */
  onlyUnmanaged?: boolean;
  nextContinue?: string;
  addDevicesSummary?: boolean;
  limit?: number;
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
  onlyUnmanaged,
  addDevicesSummary,
  nextContinue,
}: {
  name?: string;
  onlyUnmanaged?: boolean;
  addDevicesSummary?: boolean;
  nextContinue?: string;
}) => {
  const params = new URLSearchParams({
    limit: `${PAGE_SIZE}`,
  });
  const fieldSelectors: string[] = [];
  if (onlyUnmanaged) {
    fieldSelectors.push('!metadata.owner');
  }
  if (name) {
    fieldSelectors.push(`metadata.name contains ${name}`);
  }
  if (fieldSelectors.length > 0) {
    params.set('fieldSelector', fieldSelectors.join(','));
  }
  if (addDevicesSummary) {
    params.set('addDevicesSummary', 'true');
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
  pagination: PaginationDetails<FleetList>;
};

export const useFleets = (args: FleetsEndpointArgs): FleetLoad => {
  const pagination = useTablePagination<FleetList>();
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
