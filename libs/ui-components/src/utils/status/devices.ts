import { TFunction } from 'react-i18next';
import { PowerOffIcon } from '@patternfly/react-icons/dist/js/icons';
import { PauseCircleIcon } from '@patternfly/react-icons/dist/js/icons/pause-circle-icon';

import {
  DeviceStatus,
  DeviceSummaryStatusType as DeviceSummaryStatus,
  DeviceSummaryStatusType,
} from '@flightctl/types';
import { EnrollmentRequestStatus, FilterSearchParams, StatusItem } from './common';

export const getDeviceSummaryStatus = (deviceStatus?: DeviceStatus): DeviceSummaryStatusType =>
  deviceStatus?.summary.status || DeviceSummaryStatusType.DeviceSummaryStatusUnknown;

export const getDeviceStatusItems = (t: TFunction): StatusItem<DeviceSummaryStatus | EnrollmentRequestStatus>[] => [
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
    id: DeviceSummaryStatus.DeviceSummaryStatusOnline,
    label: t('Online'),
    level: 'success',
  },
  {
    type: FilterSearchParams.DeviceStatus,
    id: DeviceSummaryStatus.DeviceSummaryStatusDegraded,
    label: t('Degraded'),
    level: 'warning',
  },
  {
    type: FilterSearchParams.DeviceStatus,
    id: DeviceSummaryStatus.DeviceSummaryStatusError,
    label: t('Error'),
    level: 'danger',
  },
  {
    type: FilterSearchParams.DeviceStatus,
    id: DeviceSummaryStatus.DeviceSummaryStatusRebooting,
    label: t('Rebooting'),
    level: 'info',
  },
  {
    type: FilterSearchParams.DeviceStatus,
    id: DeviceSummaryStatus.DeviceSummaryStatusPoweredOff,
    label: t('Powered Off'),
    level: 'unknown',
    customIcon: PowerOffIcon,
  },
  {
    type: FilterSearchParams.DeviceStatus,
    id: DeviceSummaryStatus.DeviceSummaryStatusUnknown,
    label: t('Unknown'),
    level: 'unknown',
  },
];

export const deviceStatusOrder = getDeviceStatusItems((s: string) => s).map((item) => item.id);
