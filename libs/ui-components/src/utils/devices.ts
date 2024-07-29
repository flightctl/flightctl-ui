import { DeviceSpec, ObjectMeta } from '@flightctl/types';
import { ConfigTemplate, isGitProviderSpec, isHttpProviderSpec, isKubeProviderSpec } from '../types/deviceSpec';

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

export { getDeviceFleet, getSourceItems };
