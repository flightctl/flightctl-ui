import { TFunction } from 'react-i18next';
import { PowerOffIcon } from '@patternfly/react-icons/dist/js/icons';
import BanIcon from '@patternfly/react-icons/dist/js/icons/ban-icon';

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
  DeviceStatus = 'devSt',
  AppStatus = 'appSt',
  UpdatedStatus = 'updSt',
  Label = 'label',
  NameOrAlias = 'nameOrAlias',
}

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
];

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
