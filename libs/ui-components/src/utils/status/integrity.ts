import { TFunction } from 'i18next';
import { DeviceIntegrityStatusSummaryType } from '@flightctl/types';
import { StatusItem } from './common';

export const getIntegrityStatusItems = (t: TFunction): StatusItem<DeviceIntegrityStatusSummaryType>[] => [
  {
    id: DeviceIntegrityStatusSummaryType.DeviceIntegrityStatusPassed,
    label: t('Passed'),
    level: 'success',
  },
  {
    id: DeviceIntegrityStatusSummaryType.DeviceIntegrityStatusFailed,
    label: t('Failed'),
    level: 'danger',
  },
  {
    id: DeviceIntegrityStatusSummaryType.DeviceIntegrityStatusUnsupported,
    label: t('Unsupported'),
    level: 'warning',
  },
  {
    id: DeviceIntegrityStatusSummaryType.DeviceIntegrityStatusUnknown,
    label: t('Unknown'),
    level: 'unknown',
  },
];
