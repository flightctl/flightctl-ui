import * as React from 'react';
import { useDebounce } from 'use-debounce';

import { Device, DeviceList, DevicesSummary } from '@flightctl/types';
import { FilterSearchParams } from '../../../utils/status/devices';
import { addQueryConditions, setLabelParams } from '../../../utils/query';
import { useFetchPeriodically } from '../../../hooks/useFetchPeriodically';
import { FlightCtlLabel } from '../../../types/extraTypes';
import { FilterStatusMap } from './types';
import { fromAPILabel } from '../../../utils/labels';

type DevicesEndpointArgs = {
  nameOrAlias?: string;
  ownerFleets?: string[];
  activeStatuses?: FilterStatusMap;
  labels?: FlightCtlLabel[];
  summaryOnly?: boolean;
};

const getDevicesEndpoint = ({ nameOrAlias, ownerFleets, activeStatuses, labels, summaryOnly }: DevicesEndpointArgs) => {
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
  if (nameOrAlias) {
    // Partial string match
    fieldSelectors.push(`metadata.nameoralias~=%${nameOrAlias}%`);
  }

  const params = new URLSearchParams();
  if (fieldSelectors.length > 0) {
    params.set('fieldSelector', fieldSelectors.join(','));
  }
  if (summaryOnly) {
    params.set('summaryOnly', 'true');
  }
  setLabelParams(params, labels);
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
  nameOrAlias,
  ownerFleets,
  activeStatuses,
  labels,
}: {
  nameOrAlias?: string;
  ownerFleets?: string[];
  activeStatuses?: FilterStatusMap;
  labels?: FlightCtlLabel[];
}): [Device[], boolean, unknown, boolean, VoidFunction, FlightCtlLabel[]] => {
  const [deviceLabelList] = useFetchPeriodically<DeviceList>({
    endpoint: 'devices',
  });
  const [devicesEndpoint, devicesDebouncing] = useDevicesEndpoint({ nameOrAlias, ownerFleets, activeStatuses, labels });
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
