import * as React from 'react';

import { DeviceSummaryStatusType } from '@flightctl/types';
import { FlightCtlLabel } from '../../../../types/extraTypes';

import { useTranslation } from '../../../../hooks/useTranslation';
import { getDeviceStatusHelperText } from '../../../Status/utils';
import { getDeviceStatusItems } from '../../../../utils/status/devices';
import { FilterSearchParams } from '../../../../utils/status/devices';
import { toOverviewChartData } from './utils';
import DonutChart from '../../../charts/DonutChart';

const DeviceStatusChart = ({
  deviceStatus,
  labels,
  fleets,
}: {
  deviceStatus: Record<string, number>;
  labels: FlightCtlLabel[];
  fleets: string[];
}) => {
  const { t } = useTranslation();

  const statusItems = getDeviceStatusItems(t);

  const devStatusData = toOverviewChartData<DeviceSummaryStatusType>(
    deviceStatus,
    statusItems,
    labels,
    fleets,
    FilterSearchParams.DeviceStatus,
  );

  return <DonutChart title={t('Device status')} data={devStatusData} helperText={getDeviceStatusHelperText(t)} />;
};

export default DeviceStatusChart;
