import { TFunction } from 'react-i18next';

import {
  ApplicationStatusType as AppStatus,
  ApplicationsSummaryStatusType as AppSummaryStatus,
} from '@flightctl/types';
import { FilterSearchParams, StatusItem } from './common';

export const getApplicationSummaryStatusItems = (t: TFunction): StatusItem<AppSummaryStatus>[] => [
  // Application summary statuses
  {
    type: FilterSearchParams.AppStatus,
    id: AppSummaryStatus.ApplicationsSummaryStatusHealthy,
    label: t('Healthy'),
    level: 'success',
  },
  {
    type: FilterSearchParams.AppStatus,
    id: AppSummaryStatus.ApplicationsSummaryStatusDegraded,
    label: t('Degraded'),
    level: 'warning',
  },
  {
    type: FilterSearchParams.AppStatus,
    id: AppSummaryStatus.ApplicationsSummaryStatusError,
    label: t('Error'),
    level: 'danger',
  },
  {
    type: FilterSearchParams.AppStatus,
    id: AppSummaryStatus.ApplicationsSummaryStatusUnknown,
    label: t('Unknown'),
    level: 'unknown',
  },
];

export const getApplicationStatusItems = (t: TFunction): StatusItem<AppStatus>[] => [
  // Application statuses
  {
    type: FilterSearchParams.AppStatus,
    id: AppStatus.ApplicationStatusRunning,
    label: t('Running'),
    level: 'success',
  },
  {
    type: FilterSearchParams.AppStatus,
    id: AppStatus.ApplicationStatusCompleted,
    label: t('Completed'),
    level: 'success',
  },
  {
    type: FilterSearchParams.AppStatus,
    id: AppStatus.ApplicationStatusPreparing,
    label: t('Preparing'),
    level: 'info',
  },
  { type: FilterSearchParams.AppStatus, id: AppStatus.ApplicationStatusStarting, label: t('Starting'), level: 'info' },
  { type: FilterSearchParams.AppStatus, id: AppStatus.ApplicationStatusError, label: t('Error'), level: 'danger' },
  {
    type: FilterSearchParams.AppStatus,
    id: AppStatus.ApplicationStatusUnknown,
    label: t('Unknown'),
    level: 'unknown',
  },
];

export const applicationSummaryStatusOrder = getApplicationSummaryStatusItems((s: string) => s).map((item) => item.id);
