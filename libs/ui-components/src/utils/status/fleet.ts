import { TFunction } from 'i18next';

import { Condition, ConditionStatus, ConditionType, Fleet } from '@flightctl/types';
import { FleetConditionType } from '../../types/extraTypes';
import { getConditionMessage } from '../error';

const FLEET_ROLLOUT_FAILED_REASON = 'Suspended';

export const fleetStatusLabels = (t: TFunction) => ({
  [ConditionType.FleetOverlappingSelectors]: t('Selectors overlap'),
  [ConditionType.FleetValid]: t('Valid'),
  Invalid: t('Invalid'),
  SyncPending: t('Sync pending'),
});

export const getFleetSyncStatus = (
  fleet: Fleet,
  t: TFunction,
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
    const message = isOK ? '' : getConditionMessage(validCondition);
    return {
      message,
      status: isOK ? ConditionType.FleetValid : 'Invalid',
    };
  }
  return {
    status: 'SyncPending',
    message: t('Waiting for first sync'),
  };
};

const isFleetRolloutFailedCondition = (rolloutCondition: Condition) =>
  rolloutCondition.status === ConditionStatus.ConditionStatusFalse &&
  rolloutCondition.reason === FLEET_ROLLOUT_FAILED_REASON;

export const getFleetRolloutStatusWarning = (fleet: Fleet, t: TFunction) => {
  const rolloutCondition = fleet.status?.conditions?.find((c) => c.type === ConditionType.FleetRollout);

  if (rolloutCondition && isFleetRolloutFailedCondition(rolloutCondition)) {
    return getConditionMessage(rolloutCondition) || t('Last rollout did not complete successfully');
  }
  return undefined;
};
