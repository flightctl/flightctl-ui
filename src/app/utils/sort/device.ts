import { Device } from '@types';
import { getDeviceFleet } from '../devices';

export const sortDevicesByOS = (resources: Device[]) =>
  resources.sort((a, b) => {
    const aOS = a.status?.systemInfo?.operatingSystem || '-';
    const bOS = b.status?.systemInfo?.operatingSystem || '-';
    return aOS.localeCompare(bOS);
  });

export const sortDevicesByFleet = (resources: Device[]) =>
  resources.sort((a, b) => {
    const aFleet = getDeviceFleet(a.metadata) || '-';
    const bFleet = getDeviceFleet(b.metadata) || '-';
    return aFleet.localeCompare(bFleet);
  });
