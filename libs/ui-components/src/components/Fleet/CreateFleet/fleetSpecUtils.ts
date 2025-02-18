import { type DeviceUpdatePolicySpec, FleetSpec, Percentage } from '@flightctl/types';

import { BatchLimitType, UpdatePolicyForm } from './../../../types/deviceSpec';
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

export const getEmptyInitializedBatch = () => ({
  limit: '',
  limitType: BatchLimitType.BatchLimitPercent,
  successThreshold: numberValue(DEFAULT_BACKEND_SUCCESS_THRESHOLD_PERCENTAGE),
  selector: [],
});

export const getEmptyUpdateFormParams = () => ({
  isEditable: true,
  isAdvanced: false,
  downloadAndInstallDiffer: false,
  // Download schedule
  downloadStartsAt: timeUtils.defaultStartTime,
  downloadEndsAt: timeUtils.defaultEndTime,
  downloadScheduleMode: timeUtils.UpdateScheduleMode.Daily,
  downloadWeekDays: [false, false, false, false, false, false, false],
  downloadTimeZone: timeUtils.localDeviceTimezone,
  // Install schedule (updateSchedule in the API)
  installStartsAt: timeUtils.defaultStartTime,
  installEndsAt: timeUtils.defaultEndTime,
  installScheduleMode: timeUtils.UpdateScheduleMode.Daily,
  installWeekDays: [false, false, false, false, false, false, false],
  installTimeZone: timeUtils.localDeviceTimezone,
});

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
  return { isAdvanced: batches.length > 0, batches, updateTimeout: timeUtils.durationToMinutes(updateTimeout) };
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

  return {
    isAdvanced: Boolean(updateSpec?.downloadSchedule?.at || updateSpec?.updateSchedule?.at),
    downloadAndInstallDiffer: !isEqual,
    downloadStartsAt,
    downloadEndsAt: timeUtils.getEndTime(downloadStartsAt, updateSpec?.downloadSchedule?.startGraceDuration),
    downloadWeekDays: downloadWeekDays.selectedDays,
    downloadScheduleMode: downloadWeekDays.allSelected
      ? timeUtils.UpdateScheduleMode.Daily
      : timeUtils.UpdateScheduleMode.Weekly,
    downloadTimeZone: updateSpec?.downloadSchedule?.timeZone || timeUtils.localDeviceTimezone,
    installStartsAt,
    installEndsAt: timeUtils.getEndTime(installStartsAt, updateSpec?.updateSchedule?.startGraceDuration),
    installWeekDays: installWeekDays.selectedDays,
    installScheduleMode: installWeekDays.allSelected
      ? timeUtils.UpdateScheduleMode.Daily
      : timeUtils.UpdateScheduleMode.Weekly,
    installTimeZone: updateSpec?.updateSchedule?.timeZone || timeUtils.localDeviceTimezone,
  };
};
