import * as React from 'react';
import { ApplicationsSummaryStatusType, Device } from '@flightctl/types';
import { useTranslation } from '../../../../hooks/useTranslation';
import { getApplicationSummaryStatusItems } from '../../../../utils/status/applications';
import { StatusMap, toChartData } from './utils';
import { FilterSearchParams } from '../../../../utils/status/devices';
import DonutChart from '../../../charts/DonutChart';
import { getApplicatioStatusHelperText } from '../../../Status/utils';

type AppStatusMap = StatusMap<ApplicationsSummaryStatusType>;

const ApplicationStatusChart = ({ resources }: { resources: Device[] }) => {
  const { t } = useTranslation();

  const statusItems = getApplicationSummaryStatusItems(t);

  const data = resources.reduce<AppStatusMap>(
    (all, curr) => {
      const appStatus =
        curr.status?.applications.summary.status || ApplicationsSummaryStatusType.ApplicationsSummaryStatusUnknown;
      all[appStatus]++;
      return all;
    },
    {
      [ApplicationsSummaryStatusType.ApplicationsSummaryStatusHealthy]: 0,
      [ApplicationsSummaryStatusType.ApplicationsSummaryStatusDegraded]: 0,
      [ApplicationsSummaryStatusType.ApplicationsSummaryStatusError]: 0,
      [ApplicationsSummaryStatusType.ApplicationsSummaryStatusUnknown]: 0,
    },
  );

  const appStatusData = toChartData(data, statusItems, FilterSearchParams.AppStatus);

  return (
    <DonutChart title={t('Application status')} data={appStatusData} helperText={getApplicatioStatusHelperText(t)} />
  );
};

export default ApplicationStatusChart;
