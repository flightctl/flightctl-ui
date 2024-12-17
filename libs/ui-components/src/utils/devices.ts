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

export const getDecommissionDisabledReason = (device: Device, t: TFunction) => {
  const lifeCycleStatus = device.status?.lifecycle?.status || DeviceLifecycleStatusType.ENROLLED;

  if (lifeCycleStatus !== DeviceLifecycleStatusType.ENROLLED) {
    return t('Device already started decommissioning');
  }
  return undefined;
};
