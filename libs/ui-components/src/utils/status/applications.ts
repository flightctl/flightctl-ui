import { TFunction } from 'react-i18next';

import {
  ApplicationStatusType as AppStatus,
  ApplicationsSummaryStatusType as AppSummaryStatus,
} from '@flightctl/types';
import { StatusItem } from './common';

export const getApplicationSummaryStatusItems = (t: TFunction): StatusItem<AppSummaryStatus>[] => [
  {
    id: AppSummaryStatus.ApplicationsSummaryStatusError,
    label: t('Error'),
    level: 'danger',
  },
  {
    id: AppSummaryStatus.ApplicationsSummaryStatusDegraded,
    label: t('Degraded'),
    level: 'warning',
  },

  {
    id: AppSummaryStatus.ApplicationsSummaryStatusUnknown,
    label: t('Unknown'),
    level: 'unknown',
  },
  {
    id: AppSummaryStatus.ApplicationsSummaryStatusHealthy,
    label: t('Healthy'),
    level: 'success',
  },
];

export const getApplicationStatusItems = (t: TFunction): StatusItem<AppStatus>[] => [
  { id: AppStatus.ApplicationStatusError, label: t('Error'), level: 'danger' },
  {
    id: AppStatus.ApplicationStatusPreparing,
    label: t('Preparing'),
    level: 'info',
  },
  { id: AppStatus.ApplicationStatusStarting, label: t('Starting'), level: 'info' },
  {
    id: AppStatus.ApplicationStatusUnknown,
    label: t('Unknown'),
    level: 'unknown',
  },
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
];

export const applicationSummaryStatusOrder = getApplicationSummaryStatusItems((s: string) => s).map((item) => item.id);
