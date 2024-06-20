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
  Current = 'status',
  Device = 'devSt',
  App = 'appSt',
  Update = 'updSt',
}

// TODO Remove these statuses when the new status API is available
export enum CurrentStatusIds {
  Approved = 'Approved',
  Available = 'Available',
  Degraded = 'Degraded',
  Denied = 'Denied',
  Pending = 'Pending',
  Progressing = 'Progressing',
  Valid = 'SpecValid',
  Unavailable = 'Unavailable',
  Unknown = 'Unknown',
}

export interface StatusFilterItem {
  type: FilterSearchParams;
  id: CurrentStatusIds | DeviceStatus | AppStatus | UpdateStatus;
  label: string;
  iconType: StatusLabelColor;
  customIcon?: React.ComponentClass<SVGIconProps>;
}

export const getDeviceStatusItems = (t: TFunction): StatusFilterItem[] => [
  // Soon to be deprecated statuses
  { type: FilterSearchParams.Current, id: CurrentStatusIds.Approved, label: t('Approved'), iconType: 'success' },
  { type: FilterSearchParams.Current, id: CurrentStatusIds.Available, label: t('Available'), iconType: 'success' },
  { type: FilterSearchParams.Current, id: CurrentStatusIds.Valid, label: t('Valid'), iconType: 'success' },
  { type: FilterSearchParams.Current, id: CurrentStatusIds.Unavailable, label: t('Unavailable'), iconType: 'danger' },
  { type: FilterSearchParams.Current, id: CurrentStatusIds.Denied, label: t('Denied'), iconType: 'danger' },
  { type: FilterSearchParams.Current, id: CurrentStatusIds.Degraded, label: t('Degraded'), iconType: 'warning' },
  { type: FilterSearchParams.Current, id: CurrentStatusIds.Pending, label: t('Pending approval'), iconType: 'info' },
  { type: FilterSearchParams.Current, id: CurrentStatusIds.Progressing, label: t('Progressing'), iconType: 'info' },
  { type: FilterSearchParams.Current, id: CurrentStatusIds.Unknown, label: t('Unknown'), iconType: 'unknown' },
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
