import * as React from 'react';
import { TFunction } from 'react-i18next';
import { PowerOffIcon } from '@patternfly/react-icons/dist/js/icons';
import { SVGIconProps } from '@patternfly/react-icons/dist/js/createIcon';

import {
  DeviceWorkloadSummaryType as AppStatus,
  DeviceSystemSummaryStatusType as DeviceStatus,
  DeviceUpdateStatusType as UpdateStatus,
} from '@flightctl/types';
import { StatusLabelColor } from '../../components/common/StatusLabel';

export enum FilterSearchParams {
  Fleet = 'fleetId',
  Device = 'devSt',
  App = 'appSt',
  Update = 'updSt',
}

export interface StatusFilterItem {
  type: FilterSearchParams;
  id: DeviceStatus | AppStatus | UpdateStatus;
  label: string;
  iconType: StatusLabelColor;
  customIcon?: React.ComponentClass<SVGIconProps>;
}

export const getDeviceStatusItems = (t: TFunction): StatusFilterItem[] => [
  // Device statuses
  {
    type: FilterSearchParams.Device,
    id: DeviceStatus.DeviceSystemSummaryStatusOnline,
    label: t('Online'),
    iconType: 'success',
  },
  {
    type: FilterSearchParams.Device,
    id: DeviceStatus.DeviceSystemSummaryStatusDegraded,
    label: t('Degraded'),
    iconType: 'warning',
  },
  {
    type: FilterSearchParams.Device,
    id: DeviceStatus.DeviceSystemSummaryStatusError,
    label: t('Error'),
    iconType: 'danger',
  },
  {
    type: FilterSearchParams.Device,
    id: DeviceStatus.DeviceSystemSummaryStatusRebooting,
    label: t('Rebooting'),
    iconType: 'danger',
  },
  {
    type: FilterSearchParams.Device,
    id: DeviceStatus.DeviceSystemSummaryStatusPoweredOff,
    label: t('Powered Off'),
    iconType: 'unknown',
    customIcon: PowerOffIcon,
  },
  {
    type: FilterSearchParams.Device,
    id: DeviceStatus.DeviceSystemSummaryStatusUnknown,
    label: t('Unknown'),
    iconType: 'unknown',
  },
  // Application statuses
  {
    type: FilterSearchParams.App,
    id: AppStatus.DeviceWorkloadSummaryHealthy,
    label: t('Healthy'),
    iconType: 'success',
  },
  {
    type: FilterSearchParams.App,
    id: AppStatus.DeviceWorkloadSummaryDegraded,
    label: t('Degraded'),
    iconType: 'warning',
  },
  { type: FilterSearchParams.App, id: AppStatus.DeviceWorkloadSummaryError, label: t('Error'), iconType: 'danger' },
  {
    type: FilterSearchParams.App,
    id: AppStatus.DeviceWorkloadSummaryUnknown,
    label: t('Unknown'),
    iconType: 'unknown',
  },
  // System update statuses
  {
    type: FilterSearchParams.Update,
    id: UpdateStatus.DeviceUpdateStatusUpToDate,
    label: t('Up-to-date'),
    iconType: 'success',
  },
  {
    type: FilterSearchParams.Update,
    id: UpdateStatus.DeviceUpdateStatusOutOfDate,
    label: t('Out-of-date'),
    iconType: 'warning',
  },
  {
    type: FilterSearchParams.Update,
    id: UpdateStatus.DeviceUpdateStatusUpdating,
    label: t('Updating'),
    iconType: 'info',
  },
  {
    type: FilterSearchParams.Update,
    id: UpdateStatus.DeviceUpdateStatusUnknown,
    label: t('Unknown'),
    iconType: 'unknown',
  },
];
