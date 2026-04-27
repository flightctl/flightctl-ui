import * as React from 'react';
import { ApplicationsSummaryStatusType, DeviceSummaryStatusType, DeviceUpdatedStatusType } from '@flightctl/types';

import {
  DEVICE_TEXT_FILTER_KEYS,
  DeviceTextFilterKey,
  FilterSearchParams,
  isValidCveIdFilterValue,
} from '../../../utils/status/devices';
import { useAppContext } from '../../../hooks/useAppContext';
import { FilterStatusMap } from './types';
import { FlightCtlLabel } from '../../../types/extraTypes';
import { labelToString } from '../../../utils/labels';

const validAppStatuses = Object.values(ApplicationsSummaryStatusType) as string[];
const validUpdatedStatuses = Object.values(DeviceUpdatedStatusType) as string[];
const validDeviceStatuses = Object.values(DeviceSummaryStatusType) as string[];

const getNewParams = (currentParams: URLSearchParams, newValues: { [key: string]: string[] }) => {
  let newParams = [...currentParams.entries()];
  const keys = Object.keys(newValues);
  newParams = newParams.filter(([key]) => !keys.includes(key));
  keys.forEach((key) => {
    newValues[key].forEach((v) => v && newParams.push([key, v]));
  });
  return newParams;
};

const buildTextFilterRemoval = (): Record<string, string[]> =>
  DEVICE_TEXT_FILTER_KEYS.reduce(
    (acc, key) => {
      acc[key] = [''];
      return acc;
    },
    {} as Record<string, string[]>,
  );

export const useDeviceBackendFilters = () => {
  const {
    router: { useSearchParams },
  } = useAppContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const paramsRef = React.useRef(searchParams);
  const ownerFleets = searchParams.getAll(FilterSearchParams.Fleet) || undefined;
  const onlyFleetless = searchParams.get(FilterSearchParams.OnlyFleetless) === 'true';

  const textFilters = React.useMemo((): Partial<Record<DeviceTextFilterKey, string>> => {
    const out: Partial<Record<DeviceTextFilterKey, string>> = {};
    for (const key of DEVICE_TEXT_FILTER_KEYS) {
      const v = searchParams.get(key) || '';
      const isValid = key === FilterSearchParams.CveId ? isValidCveIdFilterValue(v) : Boolean(v);
      if (isValid) {
        out[key] = v;
      }
    }
    return out;
  }, [searchParams]);

  const updateSearchParams = React.useCallback(
    (params: [string, string][]) => {
      const urlParams = new URLSearchParams(params);
      paramsRef.current = urlParams;
      setSearchParams(urlParams);
    },
    [setSearchParams],
  );

  const activeStatuses = React.useMemo(() => {
    const activeStatuses: FilterStatusMap = {
      [FilterSearchParams.AppStatus]: [],
      [FilterSearchParams.DeviceStatus]: [],
      [FilterSearchParams.UpdatedStatus]: [],
    };
    const deviceStatuses = searchParams.getAll(FilterSearchParams.DeviceStatus) || [];
    deviceStatuses.forEach((status) => {
      if (validDeviceStatuses.includes(status)) {
        activeStatuses[FilterSearchParams.DeviceStatus].push(status as DeviceSummaryStatusType);
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

  const selectedLabels = (searchParams.getAll(FilterSearchParams.Label) || []).map<FlightCtlLabel>((l) => {
    const labelParts = l.split('=');
    if (labelParts.length === 1) {
      return {
        key: labelParts[0],
        value: '',
      };
    }
    return {
      key: labelParts[0],
      value: labelParts[1],
    };
  });

  const setOwnerFleets = React.useCallback(
    (ownerFleets: string[]) => {
      updateSearchParams(getNewParams(paramsRef.current, { [FilterSearchParams.Fleet]: ownerFleets }));
    },
    [updateSearchParams],
  );

  const setOnlyFleetless = React.useCallback(
    (enabled: boolean) => {
      updateSearchParams(
        getNewParams(paramsRef.current, { [FilterSearchParams.OnlyFleetless]: [enabled ? 'true' : ''] }),
      );
    },
    [updateSearchParams],
  );

  const setActiveStatuses = React.useCallback(
    (activeStatuses: FilterStatusMap) => {
      updateSearchParams(getNewParams(paramsRef.current, activeStatuses));
    },
    [updateSearchParams],
  );

  const setSelectedLabels = React.useCallback(
    (labels: FlightCtlLabel[]) => {
      updateSearchParams(getNewParams(paramsRef.current, { [FilterSearchParams.Label]: labels.map(labelToString) }));
    },
    [updateSearchParams],
  );

  const setTextFilter = React.useCallback(
    (key: DeviceTextFilterKey, value: string) => {
      updateSearchParams(getNewParams(paramsRef.current, { [key]: [value] }));
    },
    [updateSearchParams],
  );

  const clearTextFilters = React.useCallback(() => {
    updateSearchParams(getNewParams(paramsRef.current, buildTextFilterRemoval()));
  }, [updateSearchParams]);

  const hasFiltersEnabled =
    !!selectedLabels.length ||
    !!ownerFleets.length ||
    onlyFleetless ||
    Object.values(activeStatuses).some((s) => !!s.length) ||
    DEVICE_TEXT_FILTER_KEYS.some((key) => !!textFilters[key]);

  return {
    textFilters,
    setTextFilter,
    clearTextFilters,
    activeStatuses,
    setActiveStatuses,
    ownerFleets,
    setOwnerFleets,
    onlyFleetless,
    setOnlyFleetless,
    selectedLabels,
    setSelectedLabels,
    hasFiltersEnabled,
  };
};
