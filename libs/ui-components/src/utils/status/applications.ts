import { TFunction } from 'react-i18next';

import {
  ApplicationStatusType as AppStatus,
  ApplicationsSummaryStatusType as AppSummaryStatus,
} from '@flightctl/types';
import { StatusItem } from './common';
import { ResourcesEmptyIcon } from '@patternfly/react-icons/dist/js/icons/resources-empty-icon';
import { PausedIcon } from '@patternfly/react-icons/dist/js/icons/paused-icon';

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
    id: AppSummaryStatus.ApplicationsSummaryStatusNoApplications,
    label: t('No applications'),
    level: 'info',
    customIcon: ResourcesEmptyIcon,
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
  {
    id: AppStatus.ApplicationStatusStopped,
    label: t('Stopped'),
    level: 'custom',
    customIcon: PausedIcon,
  },
  {
    id: AppStatus.ApplicationStatusStopping,
    label: t('Stopping'),
    level: 'info',
  },
];

export const applicationSummaryStatusOrder = getApplicationSummaryStatusItems((s: string) => s).map((item) => item.id);
