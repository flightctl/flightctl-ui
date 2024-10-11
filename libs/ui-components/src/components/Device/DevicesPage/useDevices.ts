import { useDebounce } from 'use-debounce';

import { Device, DeviceList } from '@flightctl/types';
import { FilterSearchParams } from '../../../utils/status/devices';
import { addQueryConditions, setLabelParams } from '../../../utils/query';
import { useFetchPeriodically } from '../../../hooks/useFetchPeriodically';
import { FlightCtlLabel } from '../../../types/extraTypes';
import { FilterStatusMap } from './types';

type DevicesEndpointArgs = {
  ownerFleets?: string[];
  activeStatuses?: FilterStatusMap;
  labels?: FlightCtlLabel[];
};

const getDevicesEndpoint = ({ ownerFleets, activeStatuses, labels }: DevicesEndpointArgs) => {
  const filterByAppStatus = activeStatuses?.[FilterSearchParams.AppStatus];
  const filterByDevStatus = activeStatuses?.[FilterSearchParams.DeviceStatus];
  const filterByUpdateStatus = activeStatuses?.[FilterSearchParams.UpdatedStatus];

  const fieldSelectors: string[] = [];
  addQueryConditions(fieldSelectors, 'status.applications.summary.status', filterByAppStatus);
  addQueryConditions(fieldSelectors, 'status.summary.status', filterByDevStatus);
  addQueryConditions(fieldSelectors, 'status.updated.status', filterByUpdateStatus);
  if (ownerFleets?.length) {
    addQueryConditions(
      fieldSelectors,
      'metadata.owner',
      ownerFleets.map((fleet) => `Fleet/${fleet}`),
    );
  }

  const params = new URLSearchParams();
  if (fieldSelectors.length > 0) {
    params.set('fieldSelector', fieldSelectors.join(','));
  }
  setLabelParams(params, labels);
  return params.size ? `devices?${params.toString()}` : 'devices';
};

export const useDevicesEndpoint = (args: DevicesEndpointArgs): [string, boolean] => {
  const endpoint = getDevicesEndpoint(args);
  const [devicesEndpointDebounced] = useDebounce(endpoint, 1000);
  return [devicesEndpointDebounced, endpoint !== devicesEndpointDebounced];
};

export const useDevices = ({
  ownerFleets,
  activeStatuses,
  labels,
}: {
  ownerFleets?: string[];
  activeStatuses: FilterStatusMap;
  labels?: FlightCtlLabel[];
}): [Device[], boolean, unknown, boolean, VoidFunction] => {
  const [devicesEndpoint, devicesDebouncing] = useDevicesEndpoint({ ownerFleets, activeStatuses, labels });
  const [devicesList, devicesLoading, devicesError, devicesRefetch, updating] = useFetchPeriodically<DeviceList>({
    endpoint: devicesEndpoint,
  });

  return [devicesList?.items || [], devicesLoading, devicesError, updating || devicesDebouncing, devicesRefetch];
};
