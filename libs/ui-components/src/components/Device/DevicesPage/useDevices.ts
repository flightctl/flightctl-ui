import { useDebounce } from 'use-debounce';

import { Device, DeviceLifecycleStatusType, DeviceList, DevicesSummary } from '@flightctl/types';
import { FilterSearchParams } from '../../../utils/status/devices';
import * as queryUtils from '../../../utils/query';
import { useFetchPeriodically } from '../../../hooks/useFetchPeriodically';
import { FlightCtlLabel } from '../../../types/extraTypes';
import { FilterStatusMap } from './types';
import { PAGE_SIZE } from '../../../constants';

type DevicesEndpointArgs = {
  nameOrAlias?: string;
  ownerFleets?: string[];
  activeStatuses?: FilterStatusMap;
  onlyDecommissioned?: boolean;
  labels?: FlightCtlLabel[];
  summaryOnly?: boolean;
  nextContinue?: string;
};

const enrolledStatuses = [
  DeviceLifecycleStatusType.DeviceLifecycleStatusEnrolled,
  DeviceLifecycleStatusType.DeviceLifecycleStatusUnknown,
];

const decommissionedStatuses = [
  DeviceLifecycleStatusType.DeviceLifecycleStatusDecommissioned,
  DeviceLifecycleStatusType.DeviceLifecycleStatusDecommissioning,
];

const getDevicesEndpoint = ({
  nameOrAlias,
  ownerFleets,
  activeStatuses,
  labels,
  onlyDecommissioned,
  nextContinue,
  summaryOnly,
}: DevicesEndpointArgs) => {
  const filterByAppStatus = activeStatuses?.[FilterSearchParams.AppStatus];
  const filterByDevStatus = activeStatuses?.[FilterSearchParams.DeviceStatus];
  const filterByUpdateStatus = activeStatuses?.[FilterSearchParams.UpdatedStatus];

  const fieldSelectors: string[] = [];
  queryUtils.addQueryConditions(fieldSelectors, 'status.applicationsSummary.status', filterByAppStatus);
  queryUtils.addQueryConditions(fieldSelectors, 'status.summary.status', filterByDevStatus);
  queryUtils.addQueryConditions(fieldSelectors, 'status.updated.status', filterByUpdateStatus);

  if (nameOrAlias) {
    queryUtils.addTextContainsCondition(fieldSelectors, 'metadata.nameOrAlias', nameOrAlias);
  }
  if (ownerFleets?.length) {
    queryUtils.addQueryConditions(
      fieldSelectors,
      'metadata.owner',
      ownerFleets.map((fleet) => `Fleet/${fleet}`),
    );
  }

  if (onlyDecommissioned) {
    queryUtils.addQueryConditions(fieldSelectors, 'status.lifecycle.status', decommissionedStatuses);
  } else if (summaryOnly) {
    queryUtils.addQueryConditions(fieldSelectors, 'status.lifecycle.status', enrolledStatuses);
  }

  const params = new URLSearchParams();
  if (fieldSelectors.length > 0) {
    params.set('fieldSelector', fieldSelectors.join(','));
  }
  queryUtils.setLabelParams(params, labels);
  if (summaryOnly) {
    params.set('summaryOnly', 'true');
  }
  if (nextContinue !== undefined) {
    params.set('limit', `${PAGE_SIZE}`);
  }
  if (nextContinue) {
    params.set('continue', nextContinue);
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
  onlyDecommissioned: boolean;
  nextContinue?: string;
  onPageFetched?: (data: DeviceList) => void;
}): [Device[], boolean, unknown, boolean, VoidFunction] => {
  const [devicesEndpoint, devicesDebouncing] = useDevicesEndpoint(args);

  const [devicesList, devicesLoading, devicesError, devicesRefetch, updating] = useFetchPeriodically<DeviceList>(
    {
      endpoint: devicesEndpoint,
    },
    args.onPageFetched,
  );

  return [devicesList?.items || [], devicesLoading, devicesError, updating || devicesDebouncing, devicesRefetch];
};
