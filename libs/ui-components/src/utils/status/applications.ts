import { TFunction } from 'react-i18next';

import {
  ApplicationStatusType as AppStatus,
  ApplicationsSummaryStatusType as AppSummaryStatus,
} from '@flightctl/types';
import { StatusItem } from './common';

export const getApplicationSummaryStatusItems = (t: TFunction): StatusItem<AppSummaryStatus>[] => [
  // Application summary statuses
  {
    id: AppSummaryStatus.ApplicationsSummaryStatusHealthy,
    label: t('Healthy'),
    level: 'success',
  },
  {
    id: AppSummaryStatus.ApplicationsSummaryStatusDegraded,
    label: t('Degraded'),
    level: 'warning',
  },
  {
    id: AppSummaryStatus.ApplicationsSummaryStatusError,
    label: t('Error'),
    level: 'danger',
  },
  {
    id: AppSummaryStatus.ApplicationsSummaryStatusUnknown,
    label: t('Unknown'),
    level: 'unknown',
  },
];

export const getApplicationStatusItems = (t: TFunction): StatusItem<AppStatus>[] => [
  // Application statuses
  {
    id: AppStatus.ApplicationStatusRunning,
    label: t('Running'),
    level: 'success',
  },
  {
    id: AppStatus.ApplicationStatusCompleted,
    label: t('Completed'),
    level: 'success',
  },
  {
    id: AppStatus.ApplicationStatusPreparing,
    label: t('Preparing'),
    level: 'info',
  },
  { id: AppStatus.ApplicationStatusStarting, label: t('Starting'), level: 'info' },
  { id: AppStatus.ApplicationStatusError, label: t('Error'), level: 'danger' },
  {
    id: AppStatus.ApplicationStatusUnknown,
    label: t('Unknown'),
    level: 'unknown',
  },
];

export const applicationSummaryStatusOrder = getApplicationSummaryStatusItems((s: string) => s).map((item) => item.id);
