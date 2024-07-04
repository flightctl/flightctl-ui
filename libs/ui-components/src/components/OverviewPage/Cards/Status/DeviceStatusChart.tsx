import * as React from 'react';
import DonutChart from '../../../charts/DonutChart';
import { Device, DeviceSummaryStatusType } from '@flightctl/types';
import { useTranslation } from '../../../../hooks/useTranslation';
import { EnrollmentRequestStatus } from '../../../../utils/status/common';
import { getDeviceStatusItems } from '../../../../utils/status/devices';
import { StatusMap, toChartData } from './utils';
import { FilterSearchParams } from '../../../../utils/status/common';

type DeviceStatusMap = StatusMap<DeviceSummaryStatusType | EnrollmentRequestStatus>;

const DeviceStatusChart = ({ resources }: { resources: Device[] }) => {
  const { t } = useTranslation();

  const statusItems = getDeviceStatusItems(t);

  const data = resources.reduce(
    (all, curr) => {
      const devStatus = curr.status?.summary.status || DeviceSummaryStatusType.DeviceSummaryStatusUnknown;
      all[devStatus]++;
      return all;
    },
    {
      [DeviceSummaryStatusType.DeviceSummaryStatusOnline]: 0,
      [DeviceSummaryStatusType.DeviceSummaryStatusDegraded]: 0,
      [DeviceSummaryStatusType.DeviceSummaryStatusError]: 0,
      [DeviceSummaryStatusType.DeviceSummaryStatusRebooting]: 0,
      [DeviceSummaryStatusType.DeviceSummaryStatusPoweredOff]: 0,
      [DeviceSummaryStatusType.DeviceSummaryStatusUnknown]: 0,
    } as DeviceStatusMap,
  );

  const devStatusData = toChartData(data, statusItems, FilterSearchParams.DeviceStatus);

  return <DonutChart title={t('Device status')} data={devStatusData} />;
};

export default DeviceStatusChart;
