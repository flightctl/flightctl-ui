import { type DeviceUpdatePolicySpec, FleetSpec, Percentage } from '@flightctl/types';

import { BatchForm, BatchLimitType, RolloutPolicyForm, UpdatePolicyForm } from './../../../types/deviceSpec';
import { fromAPILabel } from '../../../utils/labels';
import * as timeUtils from '../../../utils/time';
import { schedulesAreEqual } from '../../../utils/patch';

export const DEFAULT_BACKEND_UPDATE_TIMEOUT_MINUTES = 1140; // 24h, expressed in minutes
const DEFAULT_BACKEND_SUCCESS_THRESHOLD_PERCENTAGE = '90%';

const numberValue = (value: Percentage | number | undefined) => {
  if (value === undefined || typeof value === 'number') {
    return value;
  }
  return Number(value.replace(/[%]/, ''));
};

export const getEmptyInitializedBatch = (): BatchForm => ({
  limit: undefined,
  limitType: BatchLimitType.BatchLimitPercent,
  successThreshold: numberValue(DEFAULT_BACKEND_SUCCESS_THRESHOLD_PERCENTAGE),
  selector: [],
});

export const getRolloutPolicyValues = (fleetSpec?: FleetSpec): RolloutPolicyForm => {
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
  return {
    isAdvanced: batches.length > 0,
    batches: batches.length ? batches : [getEmptyInitializedBatch()],
    updateTimeout: timeUtils.durationToMinutes(updateTimeout),
  };
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

export const getUpdatePolicyValues = (updateSpec?: DeviceUpdatePolicySpec): UpdatePolicyForm => {
  const isEqual = schedulesAreEqual(updateSpec?.updateSchedule, updateSpec?.downloadSchedule);

  const downloadStartsAt = timeUtils.getTime(updateSpec?.downloadSchedule?.at);
  const installStartsAt = timeUtils.getTime(updateSpec?.updateSchedule?.at);

  const downloadWeekDays = timeUtils.getWeekDays(updateSpec?.downloadSchedule?.at);
  const installWeekDays = timeUtils.getWeekDays(updateSpec?.updateSchedule?.at);

  const downloadStartGraceDuration = updateSpec?.downloadSchedule?.startGraceDuration;
  const installStartGraceDuration = isEqual
    ? downloadStartGraceDuration
    : updateSpec?.updateSchedule?.startGraceDuration;

  return {
    isAdvanced: Boolean(updateSpec?.downloadSchedule?.at || updateSpec?.updateSchedule?.at),
    downloadAndInstallDiffer: !isEqual,
    downloadStartsAt,
    downloadEndsAt: timeUtils.getEndTime(downloadStartsAt, downloadStartGraceDuration),
    downloadStartGraceDuration,
    downloadWeekDays: downloadWeekDays.selectedDays,
    downloadScheduleMode: downloadWeekDays.allSelected
      ? timeUtils.UpdateScheduleMode.Daily
      : timeUtils.UpdateScheduleMode.Weekly,
    downloadTimeZone: updateSpec?.downloadSchedule?.timeZone || timeUtils.localDeviceTimezone,
    installStartsAt,
    installEndsAt: timeUtils.getEndTime(installStartsAt, installStartGraceDuration),
    installStartGraceDuration,
    installWeekDays: installWeekDays.selectedDays,
    installScheduleMode: installWeekDays.allSelected
      ? timeUtils.UpdateScheduleMode.Daily
      : timeUtils.UpdateScheduleMode.Weekly,
    installTimeZone: updateSpec?.updateSchedule?.timeZone || timeUtils.localDeviceTimezone,
  };
};
