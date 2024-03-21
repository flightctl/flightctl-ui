import { Fleet, ObjectMeta } from '@types';
import { FlightCtlLabel } from '@app/types/extraTypes';

const getSourceUrls = (fleet: Fleet) => {
  const templateSpecConfig = fleet.spec?.template?.spec?.config || [];
  return templateSpecConfig
    .map((config) => ('gitRef' in config ? config.gitRef?.repository : ''))
    .filter((sourceURL) => !!sourceURL);
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

export { getSourceUrls, getUpdatedFleet };
