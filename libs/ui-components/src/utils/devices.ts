import { TFunction } from 'react-i18next';

import { Device, ObjectMeta } from '@flightctl/types';

const deviceFleetRegExp = /^Fleet\/(?<fleetName>.*)$/;

export const getDeviceFleet = (metadata: ObjectMeta) => {
  const match = deviceFleetRegExp.exec(metadata.owner || '');
  return match?.groups?.fleetName || null;
};

export const hasDecommissioningStarted = (device: Device) => !!device.spec?.decommissioning;

export const getDeleteDisabledReason = (device: Device, t: TFunction) => {
  if (!hasDecommissioningStarted(device)) {
    return t('Device must be decommissioned before it can be deleted.');
  }

  return undefined;
};

export const getEditDisabledReason = (device: Device, t: TFunction) => {
  if (hasDecommissioningStarted(device)) {
    return t('Device configurations cannot be modified after device started decommissioning.');
  }
  if (getDeviceFleet(device.metadata)) {
    return t('Device is bound to a fleet and its configurations cannot be edited.');
  }
  return undefined;
};

export const getDecommissionDisabledReason = (device: Device, t: TFunction) => {
  if (hasDecommissioningStarted(device)) {
    return t('Device decommissioning already started.');
  }
  return undefined;
};
