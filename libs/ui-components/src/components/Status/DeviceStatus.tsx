import * as React from 'react';

import type { DeviceSummaryStatus } from '@flightctl/types';
import { useTranslation } from '../../hooks/useTranslation';
import { getDeviceStatusItems, getDeviceSummaryStatus } from '../../utils/status/devices';
import StatusDisplay from './StatusDisplay';

const DeviceStatus = ({ summaryStatus }: { summaryStatus?: DeviceSummaryStatus }) => {
  const { t } = useTranslation();

  const status = getDeviceSummaryStatus(summaryStatus);
  const statusItems = getDeviceStatusItems(t);

  const item = statusItems.find((statusItem) => {
    return statusItem.id === status;
  });
  return <StatusDisplay item={item} message={summaryStatus?.info} />;
};

export default DeviceStatus;
