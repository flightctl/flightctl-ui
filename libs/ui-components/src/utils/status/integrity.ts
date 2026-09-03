import { type TFunction } from 'react-i18next';

import { DeviceIntegrityCheckStatusType, DeviceIntegrityStatusSummaryType } from '@flightctl/types';
import { type StatusItem, type StatusLevel, getStatusLevelFromMap } from './common';

const INTEGRITY_STATUS_LEVELS: Record<DeviceIntegrityStatusSummaryType, StatusLevel> = {
  [DeviceIntegrityStatusSummaryType.DeviceIntegrityStatusFailed]: 'warning',
  [DeviceIntegrityStatusSummaryType.DeviceIntegrityStatusVerified]: 'success',
  [DeviceIntegrityStatusSummaryType.DeviceIntegrityStatusUnsupported]: 'unknown',
  [DeviceIntegrityStatusSummaryType.DeviceIntegrityStatusUnknown]: 'unknown',
};

export const getIntegrityStatusLevel = (status?: DeviceIntegrityStatusSummaryType) =>
  getStatusLevelFromMap(status, INTEGRITY_STATUS_LEVELS);

export const getIntegrityStatusItems = (t: TFunction): StatusItem<DeviceIntegrityStatusSummaryType>[] => [
  {
    id: DeviceIntegrityStatusSummaryType.DeviceIntegrityStatusFailed,
    label: t('Failed'),
    level: INTEGRITY_STATUS_LEVELS[DeviceIntegrityStatusSummaryType.DeviceIntegrityStatusFailed],
  },
  {
    id: DeviceIntegrityStatusSummaryType.DeviceIntegrityStatusUnsupported,
    label: t('Unsupported'),
    level: INTEGRITY_STATUS_LEVELS[DeviceIntegrityStatusSummaryType.DeviceIntegrityStatusUnsupported],
  },
  {
    id: DeviceIntegrityStatusSummaryType.DeviceIntegrityStatusUnknown,
    label: t('Unknown'),
    level: INTEGRITY_STATUS_LEVELS[DeviceIntegrityStatusSummaryType.DeviceIntegrityStatusUnknown],
  },
  {
    id: DeviceIntegrityStatusSummaryType.DeviceIntegrityStatusVerified,
    label: t('Verified'),
    level: INTEGRITY_STATUS_LEVELS[DeviceIntegrityStatusSummaryType.DeviceIntegrityStatusVerified],
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
