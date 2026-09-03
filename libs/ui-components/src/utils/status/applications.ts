import { type TFunction } from 'react-i18next';

import {
  ApplicationStatusType as AppStatus,
  ApplicationsSummaryStatusType as AppSummaryStatus,
} from '@flightctl/types';
import { ResourcesEmptyIcon } from '@patternfly/react-icons/dist/js/icons/resources-empty-icon';
import { PausedIcon } from '@patternfly/react-icons/dist/js/icons/paused-icon';

import { type StatusItem, type StatusLevel, getStatusLevelFromMap } from './common';

const APP_SUMMARY_STATUS_LEVELS: Record<AppSummaryStatus, StatusLevel> = {
  [AppSummaryStatus.ApplicationsSummaryStatusError]: 'danger',
  [AppSummaryStatus.ApplicationsSummaryStatusDegraded]: 'warning',
  [AppSummaryStatus.ApplicationsSummaryStatusNoApplications]: 'info',
  [AppSummaryStatus.ApplicationsSummaryStatusHealthy]: 'success',
  [AppSummaryStatus.ApplicationsSummaryStatusUnknown]: 'unknown',
};

const APP_STATUS_LEVELS: Record<AppStatus, StatusLevel> = {
  [AppStatus.ApplicationStatusError]: 'danger',
  [AppStatus.ApplicationStatusPreparing]: 'info',
  [AppStatus.ApplicationStatusStarting]: 'info',
  [AppStatus.ApplicationStatusStopping]: 'info',
  [AppStatus.ApplicationStatusStopped]: 'custom',
  [AppStatus.ApplicationStatusRunning]: 'success',
  [AppStatus.ApplicationStatusCompleted]: 'success',
  [AppStatus.ApplicationStatusUnknown]: 'unknown',
};

export const getAppSummaryStatusLevel = (status?: AppSummaryStatus) =>
  getStatusLevelFromMap(status, APP_SUMMARY_STATUS_LEVELS);

export const getAppStatusLevel = (status?: AppStatus) => getStatusLevelFromMap(status, APP_STATUS_LEVELS);

export const getApplicationSummaryStatusItems = (t: TFunction): StatusItem<AppSummaryStatus>[] => [
  {
    id: AppSummaryStatus.ApplicationsSummaryStatusError,
    label: t('Error'),
    level: APP_SUMMARY_STATUS_LEVELS[AppSummaryStatus.ApplicationsSummaryStatusError],
  },
  {
    id: AppSummaryStatus.ApplicationsSummaryStatusDegraded,
    label: t('Degraded'),
    level: APP_SUMMARY_STATUS_LEVELS[AppSummaryStatus.ApplicationsSummaryStatusDegraded],
  },

  {
    id: AppSummaryStatus.ApplicationsSummaryStatusUnknown,
    label: t('Unknown'),
    level: APP_SUMMARY_STATUS_LEVELS[AppSummaryStatus.ApplicationsSummaryStatusUnknown],
  },
  {
    id: AppSummaryStatus.ApplicationsSummaryStatusNoApplications,
    label: t('No applications'),
    level: APP_SUMMARY_STATUS_LEVELS[AppSummaryStatus.ApplicationsSummaryStatusNoApplications],
    customIcon: ResourcesEmptyIcon,
  },
  {
    id: AppSummaryStatus.ApplicationsSummaryStatusHealthy,
    label: t('Healthy'),
    level: APP_SUMMARY_STATUS_LEVELS[AppSummaryStatus.ApplicationsSummaryStatusHealthy],
  },
];

export const getApplicationStatusItems = (t: TFunction): StatusItem<AppStatus>[] => [
  {
    id: AppStatus.ApplicationStatusError,
    label: t('Error'),
    level: APP_STATUS_LEVELS[AppStatus.ApplicationStatusError],
  },
  {
    id: AppStatus.ApplicationStatusPreparing,
    label: t('Preparing'),
    level: APP_STATUS_LEVELS[AppStatus.ApplicationStatusPreparing],
  },
  {
    id: AppStatus.ApplicationStatusStarting,
    label: t('Starting'),
    level: APP_STATUS_LEVELS[AppStatus.ApplicationStatusStarting],
  },
  {
    id: AppStatus.ApplicationStatusUnknown,
    label: t('Unknown'),
    level: APP_STATUS_LEVELS[AppStatus.ApplicationStatusUnknown],
  },
  {
    id: AppStatus.ApplicationStatusRunning,
    label: t('Running'),
    level: APP_STATUS_LEVELS[AppStatus.ApplicationStatusRunning],
  },
  {
    id: AppStatus.ApplicationStatusCompleted,
    label: t('Completed'),
    level: APP_STATUS_LEVELS[AppStatus.ApplicationStatusCompleted],
  },
  {
    id: AppStatus.ApplicationStatusStopped,
    label: t('Stopped'),
    level: APP_STATUS_LEVELS[AppStatus.ApplicationStatusStopped],
    customIcon: PausedIcon,
  },
  {
    id: AppStatus.ApplicationStatusStopping,
    label: t('Stopping'),
    level: APP_STATUS_LEVELS[AppStatus.ApplicationStatusStopping],
  },
];

export const applicationSummaryStatusOrder = getApplicationSummaryStatusItems((s: string) => s).map((item) => item.id);
