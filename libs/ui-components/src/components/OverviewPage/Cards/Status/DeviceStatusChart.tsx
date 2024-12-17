import * as React from 'react';

import { DeviceLifecycleStatusType } from '@flightctl/types';
import { AllDeviceSummaryStatusType, FlightCtlLabel } from '../../../../types/extraTypes';

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

  // Decommissioning devices need more work. ATM, they are not being returned in the "summaryOnly" request.
  // Moreover, if we show them as "DeviceStatus", we'd need to subtract those devices from their actual deviceStatus figures.
  const statusItems = getDeviceStatusItems(t).filter(
    (item) => item.id !== DeviceLifecycleStatusType.DeviceLifecycleStatusDecommissioning,
  );

  const devStatusData = toOverviewChartData<AllDeviceSummaryStatusType>(
    deviceStatus,
    statusItems,
    labels,
    fleets,
    FilterSearchParams.DeviceStatus,
  );

  return <DonutChart title={t('Device status')} data={devStatusData} helperText={getDeviceStatusHelperText(t)} />;
};

export default DeviceStatusChart;
