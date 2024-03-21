import { ConditionStatus, ConditionType, FleetStatus } from '@types';
import { FleetConditionType } from '@app/types/extraTypes';

const getFleetStatusType = (status: FleetStatus): FleetConditionType => {
  const overlapCondition = status?.conditions?.find(
    (c) => c.type === ConditionType.FleetOverlappingSelectors && c.status === ConditionStatus.ConditionStatusTrue,
  );
  if (overlapCondition) {
    return ConditionType.FleetOverlappingSelectors;
  }

  const syncedCondition = status?.conditions?.find((c) => c.type === ConditionType.ResourceSyncSynced);
  if (syncedCondition) {
    return ConditionType.ResourceSyncSynced;
  }

  const syncingCondition = status?.conditions?.find((c) =>
    [ConditionType.ResourceSyncAccessible, ConditionType.ResourceSyncResourceParsed].includes(c.type),
  );
  if (syncingCondition) {
    return 'Syncing';
  }

  return 'Unknown';
};

export { getFleetStatusType };
