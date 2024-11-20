import * as React from 'react';
import { Flex, FlexItem } from '@patternfly/react-core';

import { DevicesSummary } from '@flightctl/types';
import { useTranslation } from '../../../hooks/useTranslation';
import { FilterSearchParams, getDeviceStatusItems } from '../../../utils/status/devices';
import { getSystemUpdateStatusItems } from '../../../utils/status/system';
import {
  getApplicationStatusHelperText,
  getDeviceStatusHelperText,
  getUpdateStatusHelperText,
} from '../../Status/utils';
import DonutChart from '../../charts/DonutChart';
import { getApplicationSummaryStatusItems } from '../../../utils/status/applications';
import { toChartData } from '../../../components/charts/utils';

interface FleetDevicesProps {
  fleetId: string;
  devicesSummary: DevicesSummary;
}

const getBaseFleetQuery = (fleetId: string) => {
  const baseQuery = new URLSearchParams();
  baseQuery.set(FilterSearchParams.Fleet, fleetId);
  return baseQuery;
};

const DevicesByAppStatusChart = ({
  fleetId,
  applicationStatus,
}: {
  fleetId: string;
  applicationStatus: DevicesSummary['applicationStatus'];
}) => {
  const { t } = useTranslation();

  const statusItems = getApplicationSummaryStatusItems(t);

  const appStatusData = toChartData(
    applicationStatus,
    statusItems,
    getBaseFleetQuery(fleetId),
    FilterSearchParams.DeviceStatus,
  );

  return (
    <DonutChart title={t('Application status')} data={appStatusData} helperText={getApplicationStatusHelperText(t)} />
  );
};

const DevicesByUpdateStatusChart = ({
  fleetId,
  updateStatus,
}: {
  fleetId: string;
  updateStatus: DevicesSummary['updateStatus'];
}) => {
  const { t } = useTranslation();

  const statusItems = getSystemUpdateStatusItems(t);

  const updateStatusData = toChartData(
    updateStatus,
    statusItems,
    getBaseFleetQuery(fleetId),
    FilterSearchParams.UpdatedStatus,
  );

  return <DonutChart title={t('Update status')} data={updateStatusData} helperText={getUpdateStatusHelperText(t)} />;
};

const DevicesByDeviceStatusChart = ({
  fleetId,
  deviceStatus,
}: {
  fleetId: string;
  deviceStatus: DevicesSummary['summaryStatus'];
}) => {
  const { t } = useTranslation();

  const statusItems = getDeviceStatusItems(t);

  const deviceStatusData = toChartData(
    deviceStatus,
    statusItems,
    getBaseFleetQuery(fleetId),
    FilterSearchParams.DeviceStatus,
  );

  return <DonutChart title={t('Device status')} data={deviceStatusData} helperText={getDeviceStatusHelperText(t)} />;
};

const FleetDevices = ({ devicesSummary, fleetId }: FleetDevicesProps) => {
  return (
    <Flex justifyContent={{ default: 'justifyContentSpaceAround' }}>
      <FlexItem>
        <DevicesByAppStatusChart fleetId={fleetId} applicationStatus={devicesSummary.applicationStatus} />
      </FlexItem>
      <FlexItem>
        <DevicesByDeviceStatusChart fleetId={fleetId} deviceStatus={devicesSummary.summaryStatus} />
      </FlexItem>
      <FlexItem>
        <DevicesByUpdateStatusChart fleetId={fleetId} updateStatus={devicesSummary.updateStatus} />
      </FlexItem>
    </Flex>
  );
};

export default FleetDevices;
