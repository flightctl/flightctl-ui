import { TFunction } from 'i18next';

import { Condition, ConditionStatus, ConditionType, Fleet } from '@flightctl/types';
import { FleetConditionType } from '../../types/extraTypes';
import { getConditionMessage } from '../error';

const FLEET_ROLLOUT_FAILED_REASON = 'Suspended';

export const fleetStatusLabels = (t: TFunction) => ({
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
    message: t('Awaiting first sync'),
  };
};

const isFleetRolloutFailedCondition = (condition: Condition) =>
  condition.type === ConditionType.FleetRolloutInProgress &&
  condition.status === ConditionStatus.ConditionStatusFalse &&
  condition.reason === FLEET_ROLLOUT_FAILED_REASON;

export const getFleetRolloutStatusWarning = (fleet: Fleet, t: TFunction) => {
  const failedRolloutCondition = fleet.status?.conditions?.find(isFleetRolloutFailedCondition);

  if (failedRolloutCondition) {
    return getConditionMessage(failedRolloutCondition) || t('Last rollout did not complete successfully');
  }
  return undefined;
};
