import { FleetStatus } from '@types';
import { FleetConditionType, FleetUpdateStatus } from '@app/types/extraTypes';

// TODO fake implementation - revisit when we have proper data
const getFleetStatusType = (status: FleetStatus): FleetUpdateStatus => {
  const syncingCondition = status?.conditions?.find((c) => c.type === ('Syncing' as FleetConditionType));
  if (syncingCondition) {
    return 'Syncing';
  }
  const syncedCondition = status?.conditions?.find((c) => c.type === ('Synced' as FleetConditionType));
  if (syncedCondition) {
    return 'Synced';
  }
  return 'Unknown';
};

export { getFleetStatusType };
