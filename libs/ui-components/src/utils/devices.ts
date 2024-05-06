import { Device, ObjectMeta } from '@flightctl/types';
import { FlightCtlLabel } from '../types/extraTypes';
import { TFunction } from 'i18next';
import { toAPILabel } from './labels';

export const getFingerprintDisplay = <R extends { metadata: ObjectMeta }>(resource: R) => {
  const fingerprint = resource.metadata.name;
  if (!fingerprint) {
    return '-';
  }
  return `${fingerprint.substring(0, 6)}...${fingerprint.substring(fingerprint.length - 7)}`;
};

const deviceFleetRegExp = /^Fleet\/(?<fleetName>.*)$/;

const getDeviceFleet = (metadata: ObjectMeta) => {
  const match = deviceFleetRegExp.exec(metadata.owner || '');
  return match?.groups?.fleetName || null;
};

const getMissingFleetDetails = (t: TFunction, metadata: ObjectMeta): { message: string; owners: string[] } => {
  const multipleOwnersInfo = Object.keys(metadata.annotations || {}).find((key) => key === 'MultipleOwners');
  if (multipleOwnersInfo) {
    // When the multiple owners issue is resolved, the annotation is still present
    const owners = metadata.annotations?.MultipleOwners || '';
    if (owners.length > 0) {
      return {
        message: t('Device is owned by more than one fleet'),
        owners: owners.split(','),
      };
    }
  }
  return {
    message: t('No fleet matches the device selectors'),
    owners: [],
  };
};

const getUpdatedDevice = (device: Device, newLabels: FlightCtlLabel[]): Device => {
  const deviceLabels: ObjectMeta['labels'] = toAPILabel(newLabels);
  return {
    ...device,
    metadata: {
      ...device.metadata,
      labels: deviceLabels,
    },
  };
};

export { getDeviceFleet, getUpdatedDevice, getMissingFleetDetails };
