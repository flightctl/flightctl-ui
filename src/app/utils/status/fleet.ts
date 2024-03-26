import { ConditionStatus, ConditionType, Fleet } from '@types';
import { FleetConditionType } from '@app/types/extraTypes';

const getFleetStatusType = (fleet: Fleet): FleetConditionType => {
  const overlapCondition = fleet.status?.conditions?.find(
    (c) => c.type === ConditionType.FleetOverlappingSelectors && c.status === ConditionStatus.ConditionStatusTrue,
  );
  if (overlapCondition) {
    return ConditionType.FleetOverlappingSelectors;
  }

  const syncedCondition = fleet.status?.conditions?.find((c) => c.type === ConditionType.ResourceSyncSynced);
  if (syncedCondition) {
    return ConditionType.ResourceSyncSynced;
  }

  const syncingCondition = fleet.status?.conditions?.find((c) =>
    [ConditionType.ResourceSyncAccessible, ConditionType.ResourceSyncResourceParsed].includes(c.type),
  );
  if (syncingCondition) {
    return 'Syncing';
  }

  return 'Unknown';
};

export { getFleetStatusType };
