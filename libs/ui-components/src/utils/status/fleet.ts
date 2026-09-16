import { type TFunction } from 'i18next';

import { type Condition, ConditionStatus, ConditionType, type Fleet } from '@flightctl/types';
import { getConditionMessage } from '../error';
import { type StatusItem, type StatusLevel, getStatusLevelFromMap } from './common';
import type { FleetStatusType } from '../../types/extraTypes';
import { getCondition } from '../api';

const FLEET_ROLLOUT_FAILED_REASON = 'Suspended';

const FLEET_STATUS_LEVELS: Record<FleetStatusType, StatusLevel> = {
  Invalid: 'danger',
  SyncPending: 'info',
  [ConditionType.FleetRolloutInProgress]: 'info',
  [ConditionType.FleetDeltaPreparing]: 'info',
  [ConditionType.FleetValid]: 'success',
};

export const getFleetStatusLevel = (status?: FleetStatusType) => getStatusLevelFromMap(status, FLEET_STATUS_LEVELS);

export const getFleetStatusItems = (t: TFunction): StatusItem<FleetStatusType>[] => [
  {
    id: 'Invalid',
    label: t('Invalid'),
    level: FLEET_STATUS_LEVELS.Invalid,
  },
  {
    id: 'SyncPending',
    label: t('Sync pending'),
    level: FLEET_STATUS_LEVELS.SyncPending,
  },
  {
    id: ConditionType.FleetDeltaPreparing,
    label: t('Preparing updates'),
    level: FLEET_STATUS_LEVELS[ConditionType.FleetDeltaPreparing],
  },
  {
    id: ConditionType.FleetRolloutInProgress,
    label: t('Rollout in progress'),
    level: FLEET_STATUS_LEVELS[ConditionType.FleetRolloutInProgress],
  },
  {
    id: ConditionType.FleetValid,
    label: t('Valid'),
    level: FLEET_STATUS_LEVELS[ConditionType.FleetValid],
  },
];

// Mimics the API shape for Device status fields
type FleetStatus = {
  type: FleetStatusType;
  info: string | undefined;
};

export const getFleetStatus = (t: TFunction, fleet: Fleet): FleetStatus => {
  const fleetConditions = fleet.status?.conditions || [];

  const validCondition = fleetConditions.find((c) => c.type === ConditionType.FleetValid);

  if (!validCondition || validCondition?.status === ConditionStatus.ConditionStatusUnknown) {
    return { type: 'SyncPending', info: t('Fleet has not been validated yet') };
  } else if (validCondition.status === ConditionStatus.ConditionStatusFalse) {
    return { type: 'Invalid', info: getConditionMessage(validCondition) };
  }

  const rolloutCondition = getCondition(fleetConditions, ConditionType.FleetRolloutInProgress);
  if (rolloutCondition && rolloutCondition.status === ConditionStatus.ConditionStatusTrue) {
    return {
      type: ConditionType.FleetRolloutInProgress,
      info: getConditionMessage(rolloutCondition as Condition),
    };
  }

  const deltaUpdatesCondition = getCondition(fleetConditions, ConditionType.FleetDeltaPreparing);
  if (deltaUpdatesCondition) {
    return { type: ConditionType.FleetDeltaPreparing, info: getConditionMessage(deltaUpdatesCondition as Condition) };
  }

  return { type: ConditionType.FleetValid, info: t('Fleet validated successfully') };
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
