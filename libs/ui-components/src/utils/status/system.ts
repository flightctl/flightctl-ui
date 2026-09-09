import { type TFunction } from 'react-i18next';

import { DeviceUpdatedStatusType as UpdatedStatus } from '@flightctl/types';
import { type StatusItem, type StatusLevel, getStatusLevelFromMap } from './common';

const SYSTEM_UPDATE_STATUS_LEVELS: Record<UpdatedStatus, StatusLevel> = {
  [UpdatedStatus.DeviceUpdatedStatusOutOfDate]: 'warning',
  [UpdatedStatus.DeviceUpdatedStatusUpdating]: 'info',
  [UpdatedStatus.DeviceUpdatedStatusUpToDate]: 'success',
  [UpdatedStatus.DeviceUpdatedStatusUnknown]: 'unknown',
};

export const getSystemUpdateStatusLevel = (status?: UpdatedStatus) =>
  getStatusLevelFromMap(status, SYSTEM_UPDATE_STATUS_LEVELS);

export const getSystemUpdateStatusItems = (t: TFunction): StatusItem<UpdatedStatus>[] => [
  {
    id: UpdatedStatus.DeviceUpdatedStatusOutOfDate,
    label: t('Out-of-date'),
    level: SYSTEM_UPDATE_STATUS_LEVELS[UpdatedStatus.DeviceUpdatedStatusOutOfDate],
  },
  {
    id: UpdatedStatus.DeviceUpdatedStatusUpdating,
    label: t('Updating'),
    level: SYSTEM_UPDATE_STATUS_LEVELS[UpdatedStatus.DeviceUpdatedStatusUpdating],
  },
  {
    id: UpdatedStatus.DeviceUpdatedStatusUnknown,
    label: t('Unknown'),
    level: SYSTEM_UPDATE_STATUS_LEVELS[UpdatedStatus.DeviceUpdatedStatusUnknown],
  },
  {
    id: UpdatedStatus.DeviceUpdatedStatusUpToDate,
    label: t('Up-to-date'),
    level: SYSTEM_UPDATE_STATUS_LEVELS[UpdatedStatus.DeviceUpdatedStatusUpToDate],
  },
];
export const systemUpdateStatusOrder = getSystemUpdateStatusItems((s: string) => s).map((item) => item.id);
