import { Device, ObjectMeta } from '@flightctl/types';
import { DeviceAnnotation, FlightCtlLabel } from '../types/extraTypes';
import { TFunction } from 'i18next';
import { toAPILabel } from './labels';
import { getMetadataAnnotation } from './api';

const deviceFleetRegExp = /^Fleet\/(?<fleetName>.*)$/;

const getDeviceFleet = (metadata: ObjectMeta) => {
  const match = deviceFleetRegExp.exec(metadata.owner || '');
  return match?.groups?.fleetName || null;
};

const getMissingFleetDetails = (t: TFunction, metadata: ObjectMeta): { message: string; owners: string[] } => {
  const multipleOwnersInfo = getMetadataAnnotation(metadata, DeviceAnnotation.MultipleOwners);
  if (multipleOwnersInfo) {
    // When the multiple owners issue is resolved, the annotation is still present
    const owners = multipleOwnersInfo || '';
    if (owners.length > 0) {
      return {
        message: t('Device is owned by more than one fleet'),
        owners: owners.split(','),
      };
    }
  }
  return {
    message: t("Device labels don't match any fleet's label selector"),
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
