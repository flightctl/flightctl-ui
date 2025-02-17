import { Duration, FleetSpec, Percentage } from '@flightctl/types';

import { BatchLimitType } from './types';
import { fromAPILabel } from '../../../utils/labels';

export const DEFAULT_BACKEND_UPDATE_TIMEOUT_MINUTES = 1140; // 24h, expressed in minutes
const DEFAULT_BACKEND_SUCCESS_THRESHOLD_PERCENTAGE = '90%';

const numberValue = (value: Percentage | number | undefined) => {
  if (value === undefined || typeof value === 'number') {
    return value;
  }
  return Number(value.replace(/[%]/, ''));
};

export const getEmptyInitializedBatch = () => ({
  limit: '',
  limitType: BatchLimitType.BatchLimitPercent,
  successThreshold: numberValue(DEFAULT_BACKEND_SUCCESS_THRESHOLD_PERCENTAGE),
  selector: [],
});

const durationToMinutes = (duration: Duration) => {
  const timeoutVal = Number(duration.replace(/[shm]/, ''));
  if (!timeoutVal) {
    return 0;
  }

  if (duration.includes('s')) {
    return Math.round(timeoutVal / 60);
  }
  if (duration.includes('h')) {
    return Math.round(timeoutVal * 60);
  }
  return timeoutVal;
};

export const getRolloutPolicyValues = (fleetSpec?: FleetSpec) => {
  const batches = (fleetSpec?.rolloutPolicy?.deviceSelection?.sequence || []).map((batch) => ({
    selector: fromAPILabel(batch.selector?.matchLabels || {}),
    limit: numberValue(batch.limit),
    limitType:
      typeof batch.limit === 'number' ? BatchLimitType.BatchLimitAbsoluteNumber : BatchLimitType.BatchLimitPercent,
    // If the policy does not specify the threshold, we set the backend's default as the field is required in the UI
    successThreshold: numberValue(batch.successThreshold || DEFAULT_BACKEND_SUCCESS_THRESHOLD_PERCENTAGE),
  }));

  // If the policy does not specify the timeout, we set the backend's default as the field is required in the UI
  const updateTimeout = fleetSpec?.rolloutPolicy?.defaultUpdateTimeout || `${DEFAULT_BACKEND_UPDATE_TIMEOUT_MINUTES}m`;
  return { isAdvanced: batches.length > 0, batches, updateTimeout: durationToMinutes(updateTimeout) };
};

export const getDisruptionBudgetValues = (fleetSpec?: FleetSpec) => {
  const budget = fleetSpec?.rolloutPolicy?.disruptionBudget || {};
  const groupLabels = budget.groupBy || [];
  return {
    isAdvanced: Boolean(groupLabels.length > 0 || budget.minAvailable || budget.maxUnavailable),
    groupBy: groupLabels,
    minAvailable: budget.minAvailable,
    maxUnavailable: budget.maxUnavailable,
  };
};
