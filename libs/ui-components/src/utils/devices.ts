import { Device, DeviceSpec, ObjectMeta } from '@flightctl/types';
import { DeviceAnnotation, FlightCtlLabel } from '../types/extraTypes';
import { TFunction } from 'i18next';
import { toAPILabel } from './labels';
import { getMetadataAnnotation } from './api';

export type SourceItem = {
  type: 'git' | 'inline' | 'secret';
  name: string;
  displayText: string;
};

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

const getSourceItems = (specConfigs: DeviceSpec['config'] | undefined): SourceItem[] => {
  return (specConfigs ?? [])
    .map((config) => {
      let sourceItem: SourceItem;
      if ('gitRef' in config) {
        sourceItem = { type: 'git', name: config.gitRef.repository, displayText: config.name };
      } else if ('secretRef' in config) {
        sourceItem = {
          type: 'secret',
          name: config.name,
          displayText: `${config.secretRef.namespace || ''}/${config.secretRef.name || ''}`,
        };
      } else {
        sourceItem = { type: 'inline', name: config.name, displayText: config.name };
      }
      return sourceItem;
    })
    .filter((repoName) => !!repoName);
};

export { getDeviceFleet, getUpdatedDevice, getMissingFleetDetails, getSourceItems };
