import { TFunction } from 'react-i18next';
import { Device, DeviceLifecycleStatusType, ObjectMeta } from '@flightctl/types';

const deviceFleetRegExp = /^Fleet\/(?<fleetName>.*)$/;

export const getDeviceFleet = (metadata: ObjectMeta) => {
  const match = deviceFleetRegExp.exec(metadata.owner || '');
  return match?.groups?.fleetName || null;
};

const hasDecommissioningStarted = (device: Device) => {
  const lifeCycleStatus = device.status?.lifecycle?.status;
  return lifeCycleStatus
    ? [
        DeviceLifecycleStatusType.DeviceLifecycleStatusDecommissioned,
        DeviceLifecycleStatusType.DeviceLifecycleStatusDecommissioning,
      ].includes(lifeCycleStatus)
    : false;
};

export const getEditDisabledReason = (device: Device, t: TFunction) => {
  if (getDeviceFleet(device.metadata)) {
    return t('Device is bound to a fleet and its configurations cannot be edited.');
  }
  if (hasDecommissioningStarted(device)) {
    return t('Device configurations cannot be modified after device started decommissioning.');
  }

  return undefined;
};

export const getDecommissionDisabledReason = (device: Device | undefined, t: TFunction) => {
  if (device && hasDecommissioningStarted(device)) {
    return t('Device decommissioning already started.');
  }
  return undefined;
};
