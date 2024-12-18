import * as React from 'react';

import { DeviceLifecycleStatusType, DeviceStatus } from '@flightctl/types';

import { useTranslation } from '../../hooks/useTranslation';
import { AllDeviceSummaryStatusType } from '../../types/extraTypes';
import { getDeviceStatusItems, getDeviceSummaryStatus } from '../../utils/status/devices';
import StatusDisplay from './StatusDisplay';

const DeviceStatus = ({ deviceStatus }: { deviceStatus?: DeviceStatus }) => {
  const { t } = useTranslation();

  const statusItems = getDeviceStatusItems(t);

  let status: AllDeviceSummaryStatusType;
  let infoMsg: string | undefined;
  if (deviceStatus?.lifecycle?.status === DeviceLifecycleStatusType.DeviceLifecycleStatusDecommissioning) {
    status = DeviceLifecycleStatusType.DeviceLifecycleStatusDecommissioning;
    infoMsg = deviceStatus?.lifecycle?.info;
  } else {
    status = getDeviceSummaryStatus(deviceStatus?.summary);
    infoMsg = deviceStatus?.summary.info;
  }

  const item = statusItems.find((statusItem) => {
    return statusItem.id === status;
  });

  return <StatusDisplay item={item} message={infoMsg} />;
};

export default DeviceStatus;
