import { Fleet, ObjectMeta } from '@flightctl/types';
import { FlightCtlLabel } from '../types/extraTypes';

const getRepositorySources = (fleet: Fleet) => {
  const templateSpecConfig = fleet.spec?.template?.spec?.config || [];
  return templateSpecConfig
    .map((config) => ('gitRef' in config ? config.gitRef?.repository : ''))
    .filter((repoName) => !!repoName);
};

const getUpdatedFleet = (fleet: Fleet, newLabels: FlightCtlLabel[]): Fleet => {
  const fleetLabels: ObjectMeta['labels'] = newLabels.reduce((acc, { key, value }) => {
    acc[key] = value;
    return acc;
  }, {});
  return {
    ...fleet,
    spec: {
      ...fleet.spec,
      selector: {
        ...fleet.spec.selector,
        matchLabels: fleetLabels,
      },
    },
  };
};

export { getRepositorySources, getUpdatedFleet };
