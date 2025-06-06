import { Device, ObjectMeta } from '@flightctl/types';
import { TFunction } from 'react-i18next';

const deviceFleetRegExp = /^Fleet\/(.*)$/;

export const getDeviceFleet = (metadata: ObjectMeta) => {
  const match = deviceFleetRegExp.exec(metadata.owner || '');
  return match ? match[1] : null;
};

export const isDeviceEnrolled = (dev: Device) => !dev.spec?.decommissioning?.target;

export const getEditDisabledReason = (device: Device, t: TFunction) => {
  if (getDeviceFleet(device.metadata)) {
    return t('Device is bound to a fleet and its configurations cannot be edited.');
  }
  if (!isDeviceEnrolled(device)) {
    return t('Device already started decommissioning and cannot be edited.');
  }
  return undefined;
};

export const getDecommissionDisabledReason = (device: Device, t: TFunction) => {
  if (!isDeviceEnrolled(device)) {
    return t('Device decommissioning already started.');
  }
  return undefined;
};
