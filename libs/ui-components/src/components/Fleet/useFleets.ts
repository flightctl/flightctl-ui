import * as React from 'react';

import { useAppContext } from '../../hooks/useAppContext';
import { useFetchPeriodically } from '../../hooks/useFetchPeriodically';
import { Fleet, FleetList } from '@flightctl/types';
import { useDebounce } from 'use-debounce';

export enum FleetSearchParams {
  Name = 'name',
}

type FleetsEndpointArgs = {
  name?: string;
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

const getFleetsEndpoint = ({ addDevicesCount, name }: { addDevicesCount?: boolean; name?: string }) => {
  const params = new URLSearchParams();
  if (name) {
    params.set('fieldSelector', `metadata.name contains ${name}`);
  }
  if (addDevicesCount) {
    params.set('addDevicesCount', 'true');
  }
  return params.size ? `fleets?${params.toString()}` : 'fleets';
};

const useFleetsEndpoint = (args: FleetsEndpointArgs): [string, boolean] => {
  const endpoint = getFleetsEndpoint(args);
  const [fleetsEndpointDebounced] = useDebounce(endpoint, 1000);
  return [fleetsEndpointDebounced, endpoint !== fleetsEndpointDebounced];
};

export const useFleets = (args: FleetsEndpointArgs): [Fleet[], boolean, unknown, boolean, VoidFunction] => {
  const [fleetsEndpoint, fleetsDebouncing] = useFleetsEndpoint(args);
  const [fleetsList, fleetsLoading, fleetsError, fleetsRefetch, updating] = useFetchPeriodically<FleetList>({
    endpoint: fleetsEndpoint,
  });

  return [fleetsList?.items || [], fleetsLoading, fleetsError, updating || fleetsDebouncing, fleetsRefetch];
};
