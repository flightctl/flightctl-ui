import * as React from 'react';

import { DeviceStatus } from '@flightctl/types';
import { useTranslation } from '../../hooks/useTranslation';
import { getDeviceStatusItems, getDeviceSummaryStatus } from '../../utils/status/devices';
import StatusDisplay from './StatusDisplay';

const DeviceStatus = ({ deviceStatus }: { deviceStatus?: DeviceStatus }) => {
  const { t } = useTranslation();

  const status = getDeviceSummaryStatus(deviceStatus?.summary);
  const statusItems = getDeviceStatusItems(t);

  const item = statusItems.find((statusItem) => {
    return statusItem.id === status;
  });
  return <StatusDisplay item={item} message={deviceStatus?.summary.info} />;
};

export default DeviceStatus;
