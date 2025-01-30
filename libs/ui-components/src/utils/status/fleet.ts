import { ConditionStatus, ConditionType, Fleet } from '@flightctl/types';
import { FleetConditionType } from '../../types/extraTypes';
import { TFunction } from 'i18next';
import { getConditionMessage } from '../error';

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

export const getFleetRolloutStatusWarning = (fleet: Fleet, t: TFunction) => {
  // TODO Review when the API for the rollout failure is available
  const rolloutBatchFailedCond = fleet.status?.conditions?.find(
    (c) => c.type === ConditionType.FleetRolloutBatchFailed && c.status === ConditionStatus.ConditionStatusTrue,
  );

  if (rolloutBatchFailedCond) {
    const info = getConditionMessage(rolloutBatchFailedCond);
    return info || t('Last rollout did not complete successfully');
  }
  return undefined;
};
