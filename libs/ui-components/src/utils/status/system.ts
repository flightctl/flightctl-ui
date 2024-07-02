import { TFunction } from 'react-i18next';

import { DeviceUpdatedStatusType as UpdatedStatus } from '@flightctl/types';
import { FilterSearchParams, StatusItem } from './common';

export const getSystemUpdateStatusItems = (t: TFunction): StatusItem<UpdatedStatus>[] => [
  {
    type: FilterSearchParams.UpdatedStatus,
    id: UpdatedStatus.DeviceUpdatedStatusUpToDate,
    label: t('Up-to-date'),
    level: 'success',
  },
  {
    type: FilterSearchParams.UpdatedStatus,
    id: UpdatedStatus.DeviceUpdatedStatusOutOfDate,
    label: t('Out-of-date'),
    level: 'warning',
  },
  {
    type: FilterSearchParams.UpdatedStatus,
    id: UpdatedStatus.DeviceUpdatedStatusUpdating,
    label: t('Updating'),
    level: 'info',
  },
  {
    type: FilterSearchParams.UpdatedStatus,
    id: UpdatedStatus.DeviceUpdatedStatusUnknown,
    label: t('Unknown'),
    level: 'unknown',
  },
];
export const systemUpdateStatusOrder = getSystemUpdateStatusItems((s: string) => s).map((item) => item.id);
