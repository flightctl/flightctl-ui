import * as React from 'react';
import { DeviceList, EnrollmentRequestList } from '@flightctl/types';
import { FilterSearchParams } from '../../../utils/status/devices';
import { useFetchPeriodically } from '../../../hooks/useFetchPeriodically';
import { DeviceLikeResource, FlightCtlLabel } from '../../../types/extraTypes';
import { EnrollmentRequestStatus, getApprovalStatus } from '../../../utils/status/enrollmentRequest';
import { FilterStatusMap } from './types';
import { useDebounce } from 'use-debounce';

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

type EREndpointArgs = {
  fleetId: string | undefined;
  activeStatuses: FilterStatusMap;
  labels?: FlightCtlLabel[];
};

const getERsEndpoint = ({ fleetId, activeStatuses, labels }: EREndpointArgs) => {
  if (fleetId) {
    return '';
  }
  if (
    Object.values(activeStatuses).some((s) => s.length) &&
    !activeStatuses[FilterSearchParams.DeviceStatus].includes(EnrollmentRequestStatus.Pending)
  ) {
    return '';
  }

  const params = new URLSearchParams();
  setLabelParams(params, labels);

  return params.size ? `enrollmentrequests?${params.toString()}` : 'enrollmentrequests';
};

type DevicesEndpointArgs = {
  fleetId?: string;
  activeStatuses?: FilterStatusMap;
  labels?: FlightCtlLabel[];
};

const getDevicesEndpoint = ({ fleetId, activeStatuses, labels }: DevicesEndpointArgs) => {
  const filterByAppStatus = activeStatuses?.[FilterSearchParams.AppStatus];
  const filterByDevStatus = activeStatuses?.[FilterSearchParams.DeviceStatus];
  const filterByUpdateStatus = activeStatuses?.[FilterSearchParams.UpdatedStatus];

  if (
    !filterByAppStatus?.length &&
    !filterByUpdateStatus?.length &&
    filterByDevStatus?.length === 1 &&
    filterByDevStatus[0] === EnrollmentRequestStatus.Pending
  ) {
    return '';
  }

  const params = new URLSearchParams();
  if (fleetId) {
    params.set('owner', `Fleet/${fleetId}`);
  }
  filterByAppStatus?.forEach((appSt) => params.append('statusFilter', `applications.summary.status=${appSt}`));
  filterByDevStatus?.forEach((devSt) => {
    if (devSt !== EnrollmentRequestStatus.Pending) {
      params.append('statusFilter', `summary.status=${devSt}`);
    }
  });
  filterByUpdateStatus?.forEach((updSt) => params.append('statusFilter', `updated.status=${updSt}`));

  setLabelParams(params, labels);
  return params.size ? `devices?${params.toString()}` : 'devices';
};

export const useDevicesEndpoint = (args: DevicesEndpointArgs) => {
  const endpoint = getDevicesEndpoint(args);
  const [devicesEndpointDebounced] = useDebounce(endpoint, 1000);
  return devicesEndpointDebounced;
};

const useERsEndpoint = (args: EREndpointArgs) => {
  const endpoint = getERsEndpoint(args);
  const [ersEndpointDebounced] = useDebounce(endpoint, 1000);
  return ersEndpointDebounced;
};

export const useDeviceLikeResources = ({
  fleetId,
  activeStatuses,
  labels,
}: {
  fleetId?: string;
  activeStatuses: FilterStatusMap;
  labels?: FlightCtlLabel[];
}): [DeviceLikeResource[], boolean, unknown, boolean, VoidFunction] => {
  const devicesEndpoint = useDevicesEndpoint({ fleetId, activeStatuses, labels });
  const [devicesList, devicesLoading, devicesError, devicesRefetch, erUpdating] = useFetchPeriodically<DeviceList>({
    endpoint: devicesEndpoint,
  });

  const ersEndpoint = useERsEndpoint({ fleetId, activeStatuses, labels });
  const [erList, erLoading, erError, erRefetch, updating] = useFetchPeriodically<EnrollmentRequestList>({
    endpoint: ersEndpoint,
  });

  const data = React.useMemo(() => {
    const devices = devicesList?.items || [];
    const ers = erList?.items || [];
    return [...devices, ...ers.filter((er) => getApprovalStatus(er) === EnrollmentRequestStatus.Pending)];
  }, [devicesList?.items, erList?.items]);

  const refetch = React.useCallback(() => {
    devicesRefetch();
    erRefetch();
  }, [devicesRefetch, erRefetch]);

  return [data, devicesLoading || erLoading, devicesError || erError, updating || erUpdating, refetch];
};
