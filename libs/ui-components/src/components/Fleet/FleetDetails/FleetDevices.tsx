import * as React from 'react';
import { Grid, GridItem } from '@patternfly/react-core';

import {
  DeviceSummaryStatusType as DeviceStatus,
  DevicesSummary,
  DeviceUpdatedStatusType as UpdateStatus,
} from '@flightctl/types';
import { useTranslation } from '../../../hooks/useTranslation';
import { FilterSearchParams, getDeviceStatusItems } from '../../../utils/status/devices';
import { getSystemUpdateStatusItems } from '../../../utils/status/system';
import { getDeviceStatusHelperText, getUpdateStatusHelperText } from '../../Status/utils';
import DonutChart from '../../charts/DonutChart';
import { toChartData } from './chartUtils';
import { EnrollmentRequestStatus } from '../../../utils/status/enrollmentRequest';

interface FleetDevicesProps {
  fleetId: string;
  devicesSummary: DevicesSummary;
}

const DevicesByUpdateStatusChart = ({ fleetId, devicesSummary }: FleetDevicesProps) => {
  const { t } = useTranslation();

  const statusItems = getSystemUpdateStatusItems(t);

  const data = statusItems.reduce(
    (acc, currStatus) => {
      acc[currStatus.id] = devicesSummary.updateStatus[currStatus.id] || 0;
      return acc;
    },
    {} as Record<UpdateStatus, number>,
  );

  const updateStatusData = toChartData(fleetId, data, statusItems, FilterSearchParams.UpdatedStatus);

  return <DonutChart title={t('Update status')} data={updateStatusData} helperText={getUpdateStatusHelperText(t)} />;
};

const DevicesByDeviceStatusChart = ({ fleetId, devicesSummary }: FleetDevicesProps) => {
  const { t } = useTranslation();

  const statusItems = getDeviceStatusItems(t);
  const data = statusItems.reduce(
    (acc, currStatus) => {
      acc[currStatus.id] = devicesSummary.summaryStatus[currStatus.id] || 0;
      return acc;
    },
    {} as Record<DeviceStatus | EnrollmentRequestStatus.Pending, number>,
  );

  const appStatusData = toChartData(fleetId, data, statusItems, FilterSearchParams.DeviceStatus);

  return <DonutChart title={t('Device status')} data={appStatusData} helperText={getDeviceStatusHelperText(t)} />;
};

const FleetDevices = ({ devicesSummary, fleetId }: FleetDevicesProps) => {
  return (
    <Grid hasGutter>
      <GridItem md={6}>
        <DevicesByDeviceStatusChart fleetId={fleetId} devicesSummary={devicesSummary} />
      </GridItem>
      <GridItem md={6}>
        <DevicesByUpdateStatusChart fleetId={fleetId} devicesSummary={devicesSummary} />
      </GridItem>
    </Grid>
  );
};

export default FleetDevices;
