import { TFunction } from 'i18next';

import { DeviceSpec, ObjectMeta } from '@flightctl/types';
import { DeviceAnnotation } from '../types/extraTypes';
import { ConfigTemplate, isGitProviderSpec, isHttpProviderSpec, isKubeProviderSpec } from '../types/deviceSpec';
import { getMetadataAnnotation } from './api';

export type SourceItem = {
  type: ConfigTemplate['type'];
  name: string;
  details: string;
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

const getSourceItems = (specConfigs: DeviceSpec['config'] | undefined): SourceItem[] => {
  return (specConfigs ?? [])
    .map((config) => {
      let sourceItem: SourceItem;
      if (isGitProviderSpec(config)) {
        sourceItem = { type: 'git', name: config.name, details: config.gitRef.repository };
      } else if (isHttpProviderSpec(config)) {
        sourceItem = { type: 'http', name: config.name, details: config.httpRef.repository };
      } else if (isKubeProviderSpec(config)) {
        sourceItem = {
          type: 'secret',
          name: config.name,
          details: `${config.secretRef.namespace || ''}/${config.secretRef.name || ''}`,
        };
      } else {
        sourceItem = { type: 'inline', name: config.name, details: '' };
      }
      return sourceItem;
    })
    .filter((repoName) => !!repoName);
};

export { getDeviceFleet, getMissingFleetDetails, getSourceItems };
