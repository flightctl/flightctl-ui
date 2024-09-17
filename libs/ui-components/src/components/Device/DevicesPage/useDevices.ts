import { useDebounce } from 'use-debounce';

import { Device, DeviceList } from '@flightctl/types';
import { FilterSearchParams } from '../../../utils/status/devices';
import { useFetchPeriodically } from '../../../hooks/useFetchPeriodically';
import { FlightCtlLabel } from '../../../types/extraTypes';
import { FilterStatusMap } from './types';

const setLabelParams = (params: URLSearchParams, labels?: FlightCtlLabel[]) => {
  if (labels?.length) {
    const labelSelector = labels.reduce((acc, curr) => {
      if (!acc) {
        acc = `${curr.key}=${curr.value || ''}`;
      } else {
        acc += `,${curr.key}=${curr.value || ''}`;
      }
      return acc;
    }, '');
    params.append('labelSelector', labelSelector);
  }
};

type DevicesEndpointArgs = {
  ownerFleets?: string[];
  activeStatuses?: FilterStatusMap;
  labels?: FlightCtlLabel[];
};

const getDevicesEndpoint = ({ ownerFleets, activeStatuses, labels }: DevicesEndpointArgs) => {
  const filterByAppStatus = activeStatuses?.[FilterSearchParams.AppStatus];
  const filterByDevStatus = activeStatuses?.[FilterSearchParams.DeviceStatus];
  const filterByUpdateStatus = activeStatuses?.[FilterSearchParams.UpdatedStatus];

  const params = new URLSearchParams();
  if (ownerFleets?.length) {
    params.set('owner', ownerFleets.map((fleet) => `Fleet/${fleet}`).join(','));
  }
  filterByAppStatus?.forEach((appSt) => params.append('statusFilter', `applications.summary.status=${appSt}`));
  filterByDevStatus?.forEach((devSt) => params.append('statusFilter', `summary.status=${devSt}`));
  filterByUpdateStatus?.forEach((updSt) => params.append('statusFilter', `updated.status=${updSt}`));

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
