import { TFunction } from 'react-i18next';

import { DeviceUpdatedStatusType as UpdatedStatus } from '@flightctl/types';
import { StatusItem } from './common';

export const getSystemUpdateStatusItems = (t: TFunction): StatusItem<UpdatedStatus>[] => [
  {
    id: UpdatedStatus.DeviceUpdatedStatusUpToDate,
    label: t('Up-to-date'),
    level: 'success',
  },
  {
    id: UpdatedStatus.DeviceUpdatedStatusOutOfDate,
    label: t('Out-of-date'),
    level: 'warning',
  },
  {
    id: UpdatedStatus.DeviceUpdatedStatusUpdating,
    label: t('Updating'),
    level: 'info',
  },
  {
    id: UpdatedStatus.DeviceUpdatedStatusUnknown,
    label: t('Unknown'),
    level: 'unknown',
  },
];
export const systemUpdateStatusOrder = getSystemUpdateStatusItems((s: string) => s).map((item) => item.id);
