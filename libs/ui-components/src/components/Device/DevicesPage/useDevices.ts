import * as React from 'react';
import { useDebounce } from 'use-debounce';

import { Device, DeviceList, DevicesSummary, SortOrder } from '@flightctl/types';
import { FilterSearchParams } from '../../../utils/status/devices';
import * as queryUtils from '../../../utils/query';
import { fromAPILabel } from '../../../utils/labels';
import { useFetchPeriodically } from '../../../hooks/useFetchPeriodically';
import { FlightCtlLabel } from '../../../types/extraTypes';
import { FilterStatusMap } from './types';

type DevicesEndpointArgs = {
  nameOrAlias?: string;
  ownerFleets?: string[];
  activeStatuses?: FilterStatusMap;
  labels?: FlightCtlLabel[];
  sortField?: string;
  direction?: string;
  summaryOnly?: boolean;
};

const getDevicesEndpoint = ({ nameOrAlias, ownerFleets, activeStatuses, labels, sortField, direction, summaryOnly }: DevicesEndpointArgs) => {
  const filterByAppStatus = activeStatuses?.[FilterSearchParams.AppStatus];
  const filterByDevStatus = activeStatuses?.[FilterSearchParams.DeviceStatus];
  const filterByUpdateStatus = activeStatuses?.[FilterSearchParams.UpdatedStatus];

  const fieldSelectors: string[] = [];
  queryUtils.addQueryConditions(fieldSelectors, 'status.applicationsSummary.status', filterByAppStatus);
  queryUtils.addQueryConditions(fieldSelectors, 'status.summary.status', filterByDevStatus);
  queryUtils.addQueryConditions(fieldSelectors, 'status.updated.status', filterByUpdateStatus);

  if (nameOrAlias) {
    queryUtils.addTextContainsCondition(fieldSelectors, 'metadata.nameoralias', nameOrAlias);
  }

  const params = new URLSearchParams();
  if (ownerFleets?.length) {
    if (summaryOnly) {
      // TODO https://issues.redhat.com/browse/EDM-681 filtering not implemented for summaryOnly+field-selector
      params.set('owner', ownerFleets.map((fleet) => `Fleet/${fleet}`).join(','));
    } else {
      queryUtils.addQueryConditions(
        fieldSelectors,
        'metadata.owner',
        ownerFleets.map((fleet) => `Fleet/${fleet}`),
      );
    }
  }
  if (fieldSelectors.length > 0) {
    params.set('fieldSelector', fieldSelectors.join(','));
  }
  queryUtils.setLabelParams(params, labels);
  if (summaryOnly) {
    params.set('summaryOnly', 'true');
  }
  if (sortField) {
    params.set('sortBy', sortField);
    params.set('sortOrder', direction || SortOrder.ASC);
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

export const useDevices = (args: {
  nameOrAlias?: string;
  ownerFleets?: string[];
  activeStatuses?: FilterStatusMap;
  labels?: FlightCtlLabel[];
  sortField?: string;
  direction?: string;
}): [Device[], boolean, unknown, boolean, VoidFunction, FlightCtlLabel[]] => {
  const [deviceLabelList] = useFetchPeriodically<DeviceList>({
    endpoint: 'devices',
  });
  const [devicesEndpoint, devicesDebouncing] = useDevicesEndpoint(args);
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
