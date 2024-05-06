import { ConditionStatus, ConditionType, Fleet } from '@flightctl/types';
import { FleetConditionType } from '../../types/extraTypes';
import { TFunction } from 'i18next';

const fleetStatusLabels = (t: TFunction) => ({
  [ConditionType.FleetOverlappingSelectors]: t('Selectors overlap'),
  [ConditionType.FleetValid]: t('Valid'),
  Invalid: t('Invalid'),
  Unknown: t('Unknown'),
});

const getFleetSyncStatus = (
  fleet: Fleet,
  t: TFunction = (s: string) => s,
): {
  status: FleetConditionType;
  message: string | undefined;
} => {
  const selectorOverlap = fleet.status?.conditions?.find(
    (c) => c.type === ConditionType.FleetOverlappingSelectors && c.status === ConditionStatus.ConditionStatusTrue,
  );
  if (selectorOverlap) {
    return {
      message:
        selectorOverlap.message ||
        t("Fleet's selector overlaps with at least one other fleet, causing ambiguous device ownership."),
      status: ConditionType.FleetOverlappingSelectors,
    };
  }

  const validCondition = (fleet.status?.conditions || []).find((c) => c.type === ConditionType.FleetValid);
  if (validCondition) {
    const isOK = validCondition.status === ConditionStatus.ConditionStatusTrue;
    return {
      message: isOK ? '' : validCondition.message,
      status: isOK ? ConditionType.FleetValid : 'Invalid',
    };
  }
  return {
    status: 'Unknown',
    message: t('Waiting for first sync'),
  };
};

export { getFleetSyncStatus, fleetStatusLabels };
