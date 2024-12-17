import { TFunction } from 'react-i18next';
import { Device, DeviceLifecycleStatusType, ObjectMeta } from '@flightctl/types';

const deviceFleetRegExp = /^Fleet\/(?<fleetName>.*)$/;

export const getDeviceFleet = (metadata: ObjectMeta) => {
  const match = deviceFleetRegExp.exec(metadata.owner || '');
  return match?.groups?.fleetName || null;
};

export const getEditDisabledReason = (device: Device, t: TFunction) => {
  if (getDeviceFleet(device.metadata)) {
    return t('Device is bound to a fleet. Its configurations cannot be edited');
  }

  return undefined;
};

const hasDecommissioningStarted = (device: Device) => {
  const lifeCycleStatus = device.status?.lifecycle?.status;
  return lifeCycleStatus ? [
    DeviceLifecycleStatusType.DeviceLifecycleStatusDecommissioned,
    DeviceLifecycleStatusType.DeviceLifecycleStatusDecommissioning,
  ].includes(lifeCycleStatus) : false
}

export const getDecommissionDisabledReason = (device: Device, t: TFunction) => {
  if (hasDecommissioningStarted(device)) {
    return t('Device already started decommissioning');
  }
  return undefined;
};
