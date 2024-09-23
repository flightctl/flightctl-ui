import { Device } from '@flightctl/types';
import { getDeviceFleet } from '../devices';

import {
  deviceStatusOrder,
  getApplicationSummaryStatus,
  getDeviceSummaryStatus,
  getSystemUpdateStatus,
} from '../status/devices';
import { applicationSummaryStatusOrder } from '../status/applications';
import { systemUpdateStatusOrder } from '../status/system';

const sortByApplicationStatus = (a: Device, b: Device) => {
  const aStatus = getApplicationSummaryStatus(a.status?.applications.summary);
  const bStatus = getApplicationSummaryStatus(b.status?.applications.summary);

  const aIndex = applicationSummaryStatusOrder.indexOf(aStatus);
  const bIndex = applicationSummaryStatusOrder.indexOf(bStatus);
  return aIndex - bIndex;
};

const sortByDeviceStatus = (a: Device, b: Device) => {
  const aStatus = getDeviceSummaryStatus(a.status?.summary);
  const bStatus = getDeviceSummaryStatus(b.status?.summary);

  const aIndex = deviceStatusOrder.indexOf(aStatus);
  const bIndex = deviceStatusOrder.indexOf(bStatus);
  return aIndex - bIndex;
};

const sortBySystemUpdateStatus = (a: Device, b: Device) => {
  const aStatus = getSystemUpdateStatus(a.status?.updated);
  const bStatus = getSystemUpdateStatus(b.status?.updated);

  const aIndex = systemUpdateStatusOrder.indexOf(aStatus);
  const bIndex = systemUpdateStatusOrder.indexOf(bStatus);
  return aIndex - bIndex;
};

export const sortDeviceStatus = (
  devices: Array<Device>,
  status: 'DeviceStatus' | 'ApplicationStatus' | 'SystemUpdateStatus',
) =>
  devices.sort((a, b) => {
    switch (status) {
      case 'ApplicationStatus':
        return sortByApplicationStatus(a, b);
      case 'DeviceStatus':
        return sortByDeviceStatus(a, b);
      case 'SystemUpdateStatus':
        return sortBySystemUpdateStatus(a, b);
    }
  });

export const sortDevicesByFleet = (resources: Array<Device>) =>
  resources.sort((a, b) => {
    const aFleet = getDeviceFleet(a.metadata);
    const bFleet = getDeviceFleet(b.metadata);
    return (aFleet || '-').localeCompare(bFleet || '-');
  });
