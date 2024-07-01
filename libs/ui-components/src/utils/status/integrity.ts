import { TFunction } from 'i18next';
import { DeviceIntegrityStatusSummaryType } from '@flightctl/types';
import { FilterSearchParams, StatusItem } from './common';

export const getIntegrityStatusItems = (t: TFunction): StatusItem<DeviceIntegrityStatusSummaryType>[] => [
  {
    type: FilterSearchParams.Noop,
    id: DeviceIntegrityStatusSummaryType.DeviceIntegrityStatusPassed,
    label: t('Passed'),
    level: 'success',
  },
  {
    type: FilterSearchParams.Noop,
    id: DeviceIntegrityStatusSummaryType.DeviceIntegrityStatusFailed,
    label: t('Failed'),
    level: 'danger',
  },
  {
    type: FilterSearchParams.Noop,
    id: DeviceIntegrityStatusSummaryType.DeviceIntegrityStatusUnsupported,
    label: t('Unsupported'),
    level: 'warning',
  },
  {
    type: FilterSearchParams.Noop,
    id: DeviceIntegrityStatusSummaryType.DeviceIntegrityStatusUnknown,
    label: t('Unknown'),
    level: 'unknown',
  },
];
