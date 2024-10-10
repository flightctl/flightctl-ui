import React from 'react';
import { useDebounce } from 'use-debounce';

import { Device, DeviceList, DevicesSummary } from '@flightctl/types';
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
  summaryOnly?: boolean;
};

const getDevicesEndpoint = ({ ownerFleets, activeStatuses, labels, summaryOnly }: DevicesEndpointArgs) => {
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

  if (summaryOnly) {
    params.set('summaryOnly', 'true');
  }
  return params.size ? `devices?${params.toString()}` : 'devices';
};

export const useDevicesEndpoint = (args: DevicesEndpointArgs): [string, boolean] => {
  const endpoint = getDevicesEndpoint(args);
  const [devicesEndpointDebounced] = useDebounce(endpoint, 1000);
  return [devicesEndpointDebounced, endpoint !== devicesEndpointDebounced];
};

export const useDevicesSummary = ({
  ownerFleets,
  labels,
}: {
  ownerFleets?: string[];
  labels?: FlightCtlLabel[];
}): [DevicesSummary | undefined, boolean] => {
  const [devicesEndpoint] = useDevicesEndpoint({ ownerFleets, labels, summaryOnly: true });
  const [deviceList, listLoading] = useFetchPeriodically<DeviceList>({
    endpoint: devicesEndpoint,
  });

  return [deviceList?.summary, listLoading];
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
  const [deviceLabelList] = useFetchPeriodically<DeviceList>({
    endpoint: 'devices',
  });
  const [devicesEndpoint, devicesDebouncing] = useDevicesEndpoint({ ownerFleets, activeStatuses, labels });
  const [devicesList, devicesLoading, devicesError, devicesRefetch, updating] = useFetchPeriodically<DeviceList>({
    endpoint: devicesEndpoint,
  });

  const allLabels = React.useMemo(() => {
    const labelsSet = new Set<FlightCtlLabel>();

    deviceLabelList?.items.forEach((device) => {
      const deviceLabels = fromAPILabel(device.metadata.labels || {}).filter((label) => label.key !== 'alias');
      deviceLabels.forEach((label) => {
        labelsSet.add(label);
      });
    });
    return Array.from(labelsSet);
  }, [deviceLabelList]);

  return [
    devicesList?.items || [],
    devicesLoading,
    devicesError,
    updating || devicesDebouncing,
    devicesRefetch,
    allLabels || [],
  ];
};
