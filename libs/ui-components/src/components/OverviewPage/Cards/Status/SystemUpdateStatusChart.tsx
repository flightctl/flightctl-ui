import * as React from 'react';
import { Device, DeviceUpdatedStatusType } from '@flightctl/types';
import { useTranslation } from '../../../../hooks/useTranslation';
import { getSystemUpdateStatusItems } from '../../../../utils/status/system';
import { StatusMap, toChartData } from './utils';
import { FilterSearchParams } from '../../../../utils/status/devices';
import DonutChart from '../../../charts/DonutChart';
import { getUpdateStatusHelperText } from '../../../Status/utils';
import { FlightCtlLabel } from '../../../../types/extraTypes';

type UpdateStatusMap = StatusMap<DeviceUpdatedStatusType>;

const SystemUpdateStatusChart = ({
  resources,
  labels,
  fleets,
}: {
  resources: Device[];
  labels: FlightCtlLabel[];
  fleets: string[];
}) => {
  const { t } = useTranslation();

  const statusItems = getSystemUpdateStatusItems(t);

  const data = resources.reduce<UpdateStatusMap>(
    (all, curr) => {
      const updateStatus = curr.status?.updated.status || DeviceUpdatedStatusType.DeviceUpdatedStatusUnknown;
      all[updateStatus]++;
      return all;
    },
    {
      [DeviceUpdatedStatusType.DeviceUpdatedStatusUpToDate]: 0,
      [DeviceUpdatedStatusType.DeviceUpdatedStatusOutOfDate]: 0,
      [DeviceUpdatedStatusType.DeviceUpdatedStatusUpdating]: 0,
      [DeviceUpdatedStatusType.DeviceUpdatedStatusUnknown]: 0,
    },
  );

  const updateStatusData = toChartData(data, statusItems, FilterSearchParams.UpdatedStatus, labels, fleets);

  return (
    <DonutChart title={t('System update status')} data={updateStatusData} helperText={getUpdateStatusHelperText(t)} />
  );
};

export default SystemUpdateStatusChart;
