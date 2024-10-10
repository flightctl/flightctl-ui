import * as React from 'react';

import { ApplicationsSummaryStatusType } from '@flightctl/types';
import { FlightCtlLabel } from '../../../../types/extraTypes';

import { useTranslation } from '../../../../hooks/useTranslation';
import { getApplicationStatusHelperText } from '../../../Status/utils';
import { getApplicationSummaryStatusItems } from '../../../../utils/status/applications';
import { FilterSearchParams } from '../../../../utils/status/devices';
import { toOverviewChartData } from './utils';
import DonutChart from '../../../charts/DonutChart';

const ApplicationStatusChart = ({
  applicationStatus,
  labels,
  fleets,
}: {
  applicationStatus: Record<string, number>;
  labels: FlightCtlLabel[];
  fleets: string[];
}) => {
  const { t } = useTranslation();

  const statusItems = getApplicationSummaryStatusItems(t);

  const appStatusData = toOverviewChartData<ApplicationsSummaryStatusType>(
    applicationStatus,
    statusItems,
    labels,
    fleets,
    FilterSearchParams.AppStatus,
  );

  return (
    <DonutChart title={t('Application status')} data={appStatusData} helperText={getApplicationStatusHelperText(t)} />
  );
};

export default ApplicationStatusChart;
