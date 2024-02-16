import { Fleet, type FleetStatus } from '@types';

const getSourceUrls = (fleet: Fleet) => {
  const templateSpecConfig = fleet.spec?.template?.spec?.config || [];
  return templateSpecConfig
    .map((config) => ('gitRef' in config ? config.gitRef?.repoURL : ''))
    .filter((sourceURL) => !!sourceURL);
};

// TODO fake implementation - revisit when we have proper data
const getFleetStatusType = (status: FleetStatus) => {
  const syncingCondition = status?.conditions?.find((c) => c.type === 'Syncing');
  if (syncingCondition) {
    return 'Syncing';
  }
  const syncedCondition = status?.conditions?.find((c) => c.type === 'Synced');
  if (syncedCondition) {
    return 'Synced';
  }
  return 'Unknown';
};

export { getSourceUrls, getFleetStatusType };
