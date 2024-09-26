import React from 'react';
import { useDebounce } from 'use-debounce';

import { Device, DeviceList } from '@flightctl/types';
import { FilterSearchParams } from '../../../utils/status/devices';
import { useFetchPeriodically } from '../../../hooks/useFetchPeriodically';
import { FlightCtlLabel } from '../../../types/extraTypes';
import { FilterStatusMap } from './types';

import { fromAPILabel } from '../../../utils/labels';

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
  activeStatuses?: FilterStatusMap;
  labels?: FlightCtlLabel[];
}): [Device[], boolean, unknown, boolean, VoidFunction, FlightCtlLabel[]] => {
  // Assumes the initial request does not have fleet / label filters
  // TODO remove when the API filters for fetching labels exist
  const [allLabels, setAllLabels] = React.useState<FlightCtlLabel[]>();
  const [devicesEndpoint, devicesDebouncing] = useDevicesEndpoint({ ownerFleets, activeStatuses, labels });
  const [devicesList, devicesLoading, devicesError, devicesRefetch, updating] = useFetchPeriodically<DeviceList>({
    endpoint: devicesEndpoint,
  });

  React.useEffect(() => {
    if (allLabels === undefined && devicesList?.items && devicesList.items.length > 0) {
      const set = new Set<FlightCtlLabel>();

      devicesList.items.forEach((device) => {
        const deviceLabels = fromAPILabel(device.metadata.labels || {}).filter((label) => label.key !== 'alias');
        deviceLabels.forEach((label) => {
          set.add(label);
        });
      });

      setAllLabels(Array.from(set));
    }
  }, [allLabels, devicesList]);

  return [
    devicesList?.items || [],
    devicesLoading,
    devicesError,
    updating || devicesDebouncing,
    devicesRefetch,
    allLabels || [],
  ];
};
