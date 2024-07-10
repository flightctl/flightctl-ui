import { TFunction } from 'react-i18next';
import { PowerOffIcon } from '@patternfly/react-icons/dist/js/icons';
import { PauseCircleIcon } from '@patternfly/react-icons/dist/js/icons/pause-circle-icon';

import {
  ApplicationsSummaryStatus,
  ApplicationsSummaryStatusType,
  DeviceSummaryStatus as BEDeviceSummaryStatus,
  DeviceIntegrityStatusSummaryType,
  DeviceSummaryStatusType,
  DeviceUpdatedStatus,
  DeviceUpdatedStatusType,
} from '@flightctl/types';
import { StatusItem } from './common';
import { EnrollmentRequestStatus } from './enrollmentRequest';

export enum FilterSearchParams {
  Fleet = 'fleetId',
  DeviceStatus = 'devSt',
  AppStatus = 'appSt',
  UpdatedStatus = 'updSt',
}

export type DeviceSummaryStatus =
  | ApplicationsSummaryStatusType
  | DeviceUpdatedStatusType
  | (DeviceSummaryStatusType | EnrollmentRequestStatus.Pending)
  | DeviceIntegrityStatusSummaryType;

export const getDeviceSummaryStatus = (deviceStatus?: BEDeviceSummaryStatus): DeviceSummaryStatusType =>
  deviceStatus?.status || DeviceSummaryStatusType.DeviceSummaryStatusUnknown;

export const getApplicationSummaryStatus = (
  appSummaryStatus?: ApplicationsSummaryStatus,
): ApplicationsSummaryStatusType =>
  appSummaryStatus?.status || ApplicationsSummaryStatusType.ApplicationsSummaryStatusUnknown;

export const getSystemUpdateStatus = (updatedStatus?: DeviceUpdatedStatus): DeviceUpdatedStatusType =>
  updatedStatus?.status || DeviceUpdatedStatusType.DeviceUpdatedStatusUnknown;

export const getDeviceStatusItems = (
  t: TFunction,
): StatusItem<DeviceSummaryStatusType | EnrollmentRequestStatus.Pending>[] => [
  {
    // For enrollment requests in pending state
    id: EnrollmentRequestStatus.Pending,
    label: t('Pending approval'),
    level: 'info',
    customIcon: PauseCircleIcon,
  },
  // Device statuses
  {
    id: DeviceSummaryStatusType.DeviceSummaryStatusOnline,
    label: t('Online'),
    level: 'success',
  },
  {
    id: DeviceSummaryStatusType.DeviceSummaryStatusDegraded,
    label: t('Degraded'),
    level: 'warning',
  },
  {
    id: DeviceSummaryStatusType.DeviceSummaryStatusError,
    label: t('Error'),
    level: 'danger',
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
    id: DeviceSummaryStatusType.DeviceSummaryStatusUnknown,
    label: t('Unknown'),
    level: 'unknown',
  },
];

export const deviceStatusOrder = getDeviceStatusItems((s: string) => s).map((item) => item.id);
