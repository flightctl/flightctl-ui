import { TFunction } from 'react-i18next';

import { DeviceIntegrityCheckStatusType, DeviceIntegrityStatusSummaryType } from '@flightctl/types';
import { StatusItem } from './common';

export const getIntegrityStatusItems = (t: TFunction): StatusItem<DeviceIntegrityStatusSummaryType>[] => [
  {
    id: DeviceIntegrityStatusSummaryType.DeviceIntegrityStatusFailed,
    label: t('Failed'),
    level: 'warning',
  },
  {
    id: DeviceIntegrityStatusSummaryType.DeviceIntegrityStatusUnsupported,
    label: t('Unsupported'),
    level: 'unknown',
  },
  {
    id: DeviceIntegrityStatusSummaryType.DeviceIntegrityStatusUnknown,
    label: t('Unknown'),
    level: 'unknown',
  },
  {
    id: DeviceIntegrityStatusSummaryType.DeviceIntegrityStatusVerified,
    label: t('Verified'),
    level: 'success',
  },
];

export const integrityCheckToSummaryType = (
  status: DeviceIntegrityCheckStatusType,
): DeviceIntegrityStatusSummaryType => {
  switch (status) {
    case DeviceIntegrityCheckStatusType.DeviceIntegrityCheckStatusVerified:
      return DeviceIntegrityStatusSummaryType.DeviceIntegrityStatusVerified;
    case DeviceIntegrityCheckStatusType.DeviceIntegrityCheckStatusFailed:
      return DeviceIntegrityStatusSummaryType.DeviceIntegrityStatusFailed;
    case DeviceIntegrityCheckStatusType.DeviceIntegrityCheckStatusUnknown:
      return DeviceIntegrityStatusSummaryType.DeviceIntegrityStatusUnknown;
    case DeviceIntegrityCheckStatusType.DeviceIntegrityCheckStatusUnsupported:
      return DeviceIntegrityStatusSummaryType.DeviceIntegrityStatusUnsupported;
  }
};

export const integrityStatusOrder = getIntegrityStatusItems((s: string) => s).map((item) => item.id);
