import * as React from 'react';

import { DeviceUpdatedStatusType } from '@flightctl/types';
import { FlightCtlLabel } from '../../../../types/extraTypes';

import { useTranslation } from '../../../../hooks/useTranslation';
import { getUpdateStatusHelperText } from '../../../Status/utils';
import { getSystemUpdateStatusItems } from '../../../../utils/status/system';
import { FilterSearchParams } from '../../../../utils/status/devices';
import { toOverviewChartData } from './utils';
import DonutChart from '../../../charts/DonutChart';

const SystemUpdateStatusChart = ({
  updatedStatus,
  labels,
  fleets,
}: {
  updatedStatus: Record<string, number>;
  labels: FlightCtlLabel[];
  fleets: string[];
}) => {
  const { t } = useTranslation();

  const statusItems = getSystemUpdateStatusItems(t);

  const updateStatusData = toOverviewChartData<DeviceUpdatedStatusType>(
    updatedStatus,
    statusItems,
    labels,
    fleets,
    FilterSearchParams.UpdatedStatus,
  );

  return (
    <DonutChart title={t('System update status')} data={updateStatusData} helperText={getUpdateStatusHelperText(t)} />
  );
};

export default SystemUpdateStatusChart;
