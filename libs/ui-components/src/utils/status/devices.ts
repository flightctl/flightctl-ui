import { TFunction } from 'react-i18next';
import { PowerOffIcon } from '@patternfly/react-icons/dist/js/icons';
import { PauseCircleIcon } from '@patternfly/react-icons/dist/js/icons/pause-circle-icon';

import {
  ApplicationsSummaryStatus,
  ApplicationsSummaryStatusType,
  DeviceSummaryStatus,
  DeviceSummaryStatusType,
  DeviceUpdatedStatus,
  DeviceUpdatedStatusType,
} from '@flightctl/types';
import { EnrollmentRequestStatus, FilterSearchParams, StatusItem } from './common';

export const getDeviceSummaryStatus = (deviceStatus?: DeviceSummaryStatus): DeviceSummaryStatusType =>
  deviceStatus?.status || DeviceSummaryStatusType.DeviceSummaryStatusUnknown;

export const getApplicationSummaryStatus = (
  appSummaryStatus?: ApplicationsSummaryStatus,
): ApplicationsSummaryStatusType =>
  appSummaryStatus?.status || ApplicationsSummaryStatusType.ApplicationsSummaryStatusUnknown;

export const getSystemUpdateStatus = (updatedStatus?: DeviceUpdatedStatus): DeviceUpdatedStatusType =>
  updatedStatus?.status || DeviceUpdatedStatusType.DeviceUpdatedStatusUnknown;

export const getDeviceStatusItems = (t: TFunction): StatusItem<DeviceSummaryStatusType | EnrollmentRequestStatus>[] => [
  {
    // For enrollment requests in pending state
    type: FilterSearchParams.DeviceStatus,
    id: EnrollmentRequestStatus.Pending,
    label: t('Pending approval'),
    level: 'info',
    customIcon: PauseCircleIcon,
  },
  // Device statuses
  {
    type: FilterSearchParams.DeviceStatus,
    id: DeviceSummaryStatusType.DeviceSummaryStatusOnline,
    label: t('Online'),
    level: 'success',
  },
  {
    type: FilterSearchParams.DeviceStatus,
    id: DeviceSummaryStatusType.DeviceSummaryStatusDegraded,
    label: t('Degraded'),
    level: 'warning',
  },
  {
    type: FilterSearchParams.DeviceStatus,
    id: DeviceSummaryStatusType.DeviceSummaryStatusError,
    label: t('Error'),
    level: 'danger',
  },
  {
    type: FilterSearchParams.DeviceStatus,
    id: DeviceSummaryStatusType.DeviceSummaryStatusRebooting,
    label: t('Rebooting'),
    level: 'info',
  },
  {
    type: FilterSearchParams.DeviceStatus,
    id: DeviceSummaryStatusType.DeviceSummaryStatusPoweredOff,
    label: t('Powered Off'),
    level: 'custom',
    customIcon: PowerOffIcon,
  },
  {
    type: FilterSearchParams.DeviceStatus,
    id: DeviceSummaryStatusType.DeviceSummaryStatusUnknown,
    label: t('Unknown'),
    level: 'unknown',
  },
];

export const deviceStatusOrder = getDeviceStatusItems((s: string) => s).map((item) => item.id);
