import * as React from 'react';
import { ApplicationsSummaryStatusType, DeviceSummaryStatusType, DeviceUpdatedStatusType } from '@flightctl/types';

import { FilterSearchParams } from '../../../utils/status/devices';
import { useAppContext } from '../../../hooks/useAppContext';
import { EnrollmentRequestStatus } from '../../../utils/status/enrollmentRequest';
import { FilterStatusMap } from './types';

const validAppStatuses = Object.values(ApplicationsSummaryStatusType) as string[];
const validUpdatedStatuses = Object.values(DeviceUpdatedStatusType) as string[];
const validDeviceStatuses = Object.values(DeviceSummaryStatusType) as string[];
validDeviceStatuses.push(EnrollmentRequestStatus.Pending);

const getNewParams = (currentParams: URLSearchParams, newValues: { [key: string]: string[] }) => {
  let newParams = [...currentParams.entries()];
  const keys = Object.keys(newValues);
  newParams = newParams.filter(([key]) => !keys.includes(key));
  keys.forEach((key) => {
    newValues[key].forEach((v) => v && newParams.push([key, v]));
  });
  return newParams;
};

export const useDeviceBackendFilters = () => {
  const {
    router: { useSearchParams },
  } = useAppContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const paramsRef = React.useRef(searchParams);
  paramsRef.current = searchParams;
  const fleetId = searchParams.get(FilterSearchParams.Fleet) || undefined;

  const activeStatuses = React.useMemo(() => {
    const activeStatuses: FilterStatusMap = {
      [FilterSearchParams.AppStatus]: [],
      [FilterSearchParams.DeviceStatus]: [],
      [FilterSearchParams.UpdatedStatus]: [],
    };
    const deviceStatuses = searchParams.getAll(FilterSearchParams.DeviceStatus) || [];
    deviceStatuses.forEach((status) => {
      if (validDeviceStatuses.includes(status)) {
        activeStatuses[FilterSearchParams.DeviceStatus].push(status as FilterStatusMap['devSt'][0]);
      }
    });
    const appStatuses = searchParams.getAll(FilterSearchParams.AppStatus) || [];
    appStatuses.forEach((status) => {
      if (validAppStatuses.includes(status)) {
        activeStatuses[FilterSearchParams.AppStatus].push(status as ApplicationsSummaryStatusType);
      }
    });

    const updateStatuses = searchParams.getAll(FilterSearchParams.UpdatedStatus) || [];
    updateStatuses.forEach((status) => {
      if (validUpdatedStatuses.includes(status)) {
        activeStatuses[FilterSearchParams.UpdatedStatus].push(status as DeviceUpdatedStatusType);
      }
    });

    return activeStatuses;
  }, [searchParams]);

  const setFleetId = React.useCallback(
    (fleedId: string) => {
      setSearchParams(getNewParams(paramsRef.current, { [FilterSearchParams.Fleet]: [fleedId] }));
    },
    [setSearchParams],
  );

  const setActiveStatuses = React.useCallback(
    (activeStatuses: FilterStatusMap) => {
      setSearchParams(getNewParams(paramsRef.current, activeStatuses));
    },
    [setSearchParams],
  );

  return {
    activeStatuses,
    setActiveStatuses,
    fleetId,
    setFleetId,
    hasFiltersEnabled: !!fleetId || !!Object.values(activeStatuses).some((s) => !!s.length),
  };
};
