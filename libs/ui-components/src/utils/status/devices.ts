import { TFunction } from 'react-i18next';
import { PowerOffIcon } from '@patternfly/react-icons/dist/js/icons/power-off-icon';
import { PauseCircleIcon } from '@patternfly/react-icons/dist/js/icons/pause-circle-icon';
import { BanIcon } from '@patternfly/react-icons/dist/js/icons/ban-icon';
import { PendingIcon } from '@patternfly/react-icons/dist/js/icons/pending-icon';
import suspendedColor from '@patternfly/react-tokens/dist/js/t_color_orange_40';
import pendingSyncColor from '@patternfly/react-tokens/dist/js/t_global_color_status_info_200';

import {
  ApplicationsSummaryStatusType,
  DeviceSummaryStatus as BEDeviceSummaryStatus,
  Device,
  DeviceIntegrityStatusSummaryType,
  DeviceLifecycleStatusType,
  DeviceSummaryStatusType,
  DeviceUpdatedStatusType,
} from '@flightctl/types';
import { StatusItem } from './common';

export enum FilterSearchParams {
  Fleet = 'fleetId',
  OnlyFleetless = 'onlyFleetless',
  DeviceStatus = 'devSt',
  AppStatus = 'appSt',
  UpdatedStatus = 'updSt',
  Label = 'label',
  NameOrAlias = 'nameOrAlias',
  CveId = 'cveId',
}

// Filters that require the user to enter some free-text
export const DEVICE_TEXT_FILTER_KEYS = [FilterSearchParams.NameOrAlias, FilterSearchParams.CveId];

export type DeviceTextFilterKey = (typeof DEVICE_TEXT_FILTER_KEYS)[number];
export type DeviceFilterTypes = DeviceTextFilterKey | FilterSearchParams.Label;
const CVE_ID_FILTER_PATTERN = /^CVE-\d{4}-\d{4,}$/i;

// Attempting to search for an invalid CVE ID will result in a 400 error from the backend.
export const isValidCveIdFilterValue = (value: string | undefined): boolean => {
  const trimmed = value?.trim() ?? '';
  if (trimmed.length === 0) {
    return true;
  }
  return CVE_ID_FILTER_PATTERN.test(trimmed);
};

export type DeviceSummaryStatus =
  | ApplicationsSummaryStatusType
  | DeviceUpdatedStatusType
  | DeviceSummaryStatusType
  | DeviceIntegrityStatusSummaryType;

export const getDeviceSummaryStatus = (deviceStatus?: BEDeviceSummaryStatus): DeviceSummaryStatusType =>
  deviceStatus?.status || DeviceSummaryStatusType.DeviceSummaryStatusUnknown;

export const getDeviceLifecycleStatus = (device: Device): DeviceLifecycleStatusType => {
  const lifecycleStatus = device.status?.lifecycle?.status || DeviceLifecycleStatusType.DeviceLifecycleStatusEnrolled;
  const isDecomStatus = [
    DeviceLifecycleStatusType.DeviceLifecycleStatusDecommissioning,
    DeviceLifecycleStatusType.DeviceLifecycleStatusDecommissioned,
  ].includes(lifecycleStatus);

  if (!isDecomStatus && device.spec?.decommissioning?.target) {
    return DeviceLifecycleStatusType.DeviceLifecycleStatusDecommissioning;
  }

  return lifecycleStatus;
};

export const getDeviceStatusItems = (t: TFunction): StatusItem<DeviceSummaryStatusType>[] => [
  {
    id: DeviceSummaryStatusType.DeviceSummaryStatusError,
    label: t('Error'),
    level: 'danger',
  },
  {
    id: DeviceSummaryStatusType.DeviceSummaryStatusDegraded,
    label: t('Degraded'),
    level: 'warning',
  },
  {
    id: DeviceSummaryStatusType.DeviceSummaryStatusUnknown,
    label: t('Unknown'),
    level: 'unknown',
  },
  {
    id: DeviceSummaryStatusType.DeviceSummaryStatusRebooting,
    label: t('Rebooting'),
    level: 'info',
  },
  {
    id: DeviceSummaryStatusType.DeviceSummaryStatusPoweredOff,
    label: t('Powered Off'),
    level: 'custom',
    customIcon: PowerOffIcon,
  },
  {
    id: DeviceSummaryStatusType.DeviceSummaryStatusOnline,
    label: t('Online'),
    level: 'success',
  },
  {
    id: DeviceSummaryStatusType.DeviceSummaryStatusAwaitingReconnect,
    label: t('Pending sync'),
    level: 'info',
    customIcon: PendingIcon,
    customColor: pendingSyncColor.value,
  },
  {
    id: DeviceSummaryStatusType.DeviceSummaryStatusConflictPaused,
    label: t('Suspended'),
    level: 'custom',
    customIcon: PauseCircleIcon,
    customColor: suspendedColor.value,
  },
];

export const getDeviceFilterLabel = (t: TFunction, key: DeviceFilterTypes) => {
  switch (key) {
    case FilterSearchParams.NameOrAlias:
      return t('Name and alias');
    case FilterSearchParams.CveId:
      return t('CVE ID');
    case FilterSearchParams.Label:
      return t('Labels and fleets');
    default:
      return key;
  }
};

/**
 * Returns device status items for the Overview page, allowing to exclude statuses.
 * If "AwaitingReconnect" or "ConflictPaused" statuses are present, they are ordered at the beginning
 */
export const getOverviewDeviceStatusItems = (
  t: TFunction,
  excludeStatuses?: DeviceSummaryStatusType[],
): StatusItem<DeviceSummaryStatusType>[] => {
  const allStatusItems = getDeviceStatusItems(t);

  const filteredItems = excludeStatuses
    ? allStatusItems.filter((item) => !excludeStatuses.includes(item.id))
    : allStatusItems;

  const priorityStatuses = [
    DeviceSummaryStatusType.DeviceSummaryStatusAwaitingReconnect,
    DeviceSummaryStatusType.DeviceSummaryStatusConflictPaused,
  ];

  const priorityItems = filteredItems.filter((item) => priorityStatuses.includes(item.id));
  const otherItems = filteredItems.filter((item) => !priorityStatuses.includes(item.id));

  const orderedPriorityItems = priorityStatuses
    .map((status) => priorityItems.find((item) => item.id === status))
    .filter(Boolean) as StatusItem<DeviceSummaryStatusType>[];

  return [...orderedPriorityItems, ...otherItems];
};

export const getDeviceLifecycleStatusItems = (t: TFunction): StatusItem<DeviceLifecycleStatusType>[] => [
  {
    id: DeviceLifecycleStatusType.DeviceLifecycleStatusDecommissioned,
    label: t('Decommissioned'),
    level: 'unknown',
    customIcon: BanIcon,
  },
  {
    id: DeviceLifecycleStatusType.DeviceLifecycleStatusDecommissioning,
    label: t('Decommissioning'),
    level: 'warning',
  },
  {
    id: DeviceLifecycleStatusType.DeviceLifecycleStatusUnknown,
    label: t('Unknown'),
    level: 'unknown',
  },
  {
    id: DeviceLifecycleStatusType.DeviceLifecycleStatusEnrolled,
    label: t('Enrolled'),
    level: 'success',
  },
];

export const deviceStatusOrder = getDeviceStatusItems((s: string) => s).map((item) => item.id);
