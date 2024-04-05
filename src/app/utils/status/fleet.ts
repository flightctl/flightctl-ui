import { ConditionStatus, ConditionType, Fleet } from '@types';
import { FleetConditionType } from '@app/types/extraTypes';

const getFleetStatusType = (fleet: Fleet): FleetConditionType => {
  const hasSelectorOverlap = fleet.status?.conditions?.some(
    (c) => c.type === ConditionType.FleetOverlappingSelectors && c.status === ConditionStatus.ConditionStatusTrue,
  );
  if (hasSelectorOverlap) {
    return ConditionType.FleetOverlappingSelectors;
  }

  const validCondition = (fleet.status?.conditions || []).find((c) => c.type === ConditionType.FleetValid);
  if (validCondition) {
    return validCondition.status === ConditionStatus.ConditionStatusTrue ? ConditionType.FleetValid : 'Invalid';
  }
  return 'Unknown';
};

export { getFleetStatusType };
