import type {
  DeviceUpdatePolicySpec,
  FleetSpec,
  Percentage,
  RolloutPolicy,
  RolloutPolicyDeltaGeneration,
  UpdateSchedule,
} from '@flightctl/types';
import { type TFunction } from 'i18next';

import {
  type BatchForm,
  BatchLimitType,
  type DeltaGenerationForm,
  type FleetFormValues,
  type OneTimeWindowForm,
  type RolloutPolicyForm,
  UpdateMode,
  type UpdatePolicyForm,
} from './../../../types/deviceSpec';
import { fromAPILabel } from '../../../utils/labels';
import * as timeUtils from '../../../utils/time';

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
    isCustomized: batches.length > 0,
    batches: batches.length ? batches : [getEmptyInitializedBatch()],
    updateTimeout: timeUtils.durationToMinutes(updateTimeout),
  };
};

export const getDisruptionBudgetValues = (fleetSpec?: FleetSpec) => {
  const budget = fleetSpec?.rolloutPolicy?.disruptionBudget || {};
  const groupLabels = budget.groupBy || [];
  return {
    isCustomized: Boolean(groupLabels.length > 0 || budget.minAvailable || budget.maxUnavailable),
    groupBy: groupLabels,
    minAvailable: budget.minAvailable,
    maxUnavailable: budget.maxUnavailable,
  };
};

const toOneTimeWindowForms = (
  schedule: 'download' | 'install',
  windows: UpdateSchedule['oneTimeWindows'] = [],
): OneTimeWindowForm[] =>
  windows.map((window, index) => ({
    id: `otw-${schedule}-${window.date}-${window.at}-${index}`,
    date: window.date,
    startsAt: window.at,
    startGraceDuration: window.startGraceDuration || '',
    timeZone: window.timeZone,
  }));

export const getOneTimeWindowTimeZone = (
  updatePolicy: UpdatePolicyForm,
  schedule: 'download' | 'install',
  window?: Pick<OneTimeWindowForm, 'timeZone'>,
) => window?.timeZone || (schedule === 'install' ? updatePolicy.installTimeZone : updatePolicy.downloadTimeZone);

export const getUpdatePolicyValues = (updateSpec?: DeviceUpdatePolicySpec): UpdatePolicyForm => {
  const downloadSchedule = updateSpec?.downloadSchedule;
  const installSchedule = updateSpec?.updateSchedule;

  const downloadCron = downloadSchedule?.at;
  const installCron = installSchedule?.at;

  const downloadStartsAt = timeUtils.getTime(downloadCron);
  const installStartsAt = timeUtils.getTime(installCron);

  const downloadWeekDays = timeUtils.getWeekDays(downloadCron);
  const installWeekDays = timeUtils.getWeekDays(installCron);

  const downloadStartGraceDuration = downloadSchedule?.startGraceDuration;
  const installStartGraceDuration = installCron ? installSchedule?.startGraceDuration : downloadStartGraceDuration;

  const hasRecurring = Boolean(downloadCron || installCron);
  const downloadTimeZone = downloadSchedule?.timeZone || timeUtils.localDeviceTimezone;
  const installTimeZone = installSchedule
    ? installSchedule.timeZone || timeUtils.localDeviceTimezone
    : downloadTimeZone;

  const downloadOneTimeWindows = toOneTimeWindowForms('download', downloadSchedule?.oneTimeWindows);
  const installOneTimeWindows = toOneTimeWindowForms('install', installSchedule?.oneTimeWindows);

  // Keep schedule timezone differences so each side retains its global default.
  const downloadAndInstallDiffer = !timeUtils.recurringSchedulesAreEqual(downloadSchedule, installSchedule);

  return {
    isCustomized: hasRecurring || downloadOneTimeWindows.length > 0 || installOneTimeWindows.length > 0,
    downloadAndInstallDiffer,
    downloadStartsAt,
    downloadStartGraceDuration,
    downloadWeekDays: downloadWeekDays.selectedDays,
    downloadScheduleMode: downloadWeekDays.allSelected
      ? timeUtils.UpdateScheduleMode.Daily
      : timeUtils.UpdateScheduleMode.Weekly,
    downloadTimeZone,
    installStartsAt,
    installStartGraceDuration,
    installWeekDays: installWeekDays.selectedDays,
    installScheduleMode: installWeekDays.allSelected
      ? timeUtils.UpdateScheduleMode.Daily
      : timeUtils.UpdateScheduleMode.Weekly,
    installTimeZone,
    downloadCron,
    installCron,
    downloadOneTimeWindows,
    installOneTimeWindows,
  };
};

export const getDownloadPolicyText = (updatePolicy: UpdatePolicyForm, t: TFunction): string => {
  if (updatePolicy.downloadCron && !timeUtils.isUiSupportedCron(updatePolicy.downloadCron)) {
    return t('Custom cron: {{ cron }}', { cron: updatePolicy.downloadCron });
  }
  const startsAt = updatePolicy.downloadStartsAt;
  return timeUtils.getScheduleUpdateText(
    {
      startsAt,
      endsAt: timeUtils.getEndTime(startsAt || timeUtils.defaultStartTime, updatePolicy.downloadStartGraceDuration),
      scheduleMode: updatePolicy.downloadScheduleMode,
      weekDays: updatePolicy.downloadWeekDays,
      timeZone: updatePolicy.downloadTimeZone,
      startGraceDuration: updatePolicy.downloadCron ? updatePolicy.downloadStartGraceDuration : undefined,
    },
    t,
  );
};

export const getInstallPolicyText = (updatePolicy: UpdatePolicyForm, t: TFunction): string => {
  if (updatePolicy.installCron && !timeUtils.isUiSupportedCron(updatePolicy.installCron)) {
    return t('Custom cron: {{ cron }}', { cron: updatePolicy.installCron });
  }
  const startsAt = updatePolicy.installStartsAt;
  return timeUtils.getScheduleUpdateText(
    {
      startsAt,
      endsAt: timeUtils.getEndTime(startsAt || timeUtils.defaultStartTime, updatePolicy.installStartGraceDuration),
      scheduleMode: updatePolicy.installScheduleMode,
      weekDays: updatePolicy.installWeekDays,
      timeZone: updatePolicy.installTimeZone,
      startGraceDuration: updatePolicy.installCron ? updatePolicy.installStartGraceDuration : undefined,
    },
    t,
  );
};

/** True when the user customized rollout hold and/or per-job timeout (non-empty inputs). */
export const hasCustomDeltaTiming = (deltaGeneration?: DeltaGenerationForm): boolean =>
  Boolean(deltaGeneration?.isCustomized && (deltaGeneration.maxWaitForDelta || deltaGeneration.deltaGenerationTimeout));

export const rolloutPolicyHasSchedulingFields = (policy?: RolloutPolicy): boolean =>
  policy?.defaultUpdateTimeout !== undefined ||
  (policy?.deviceSelection?.sequence?.length ?? 0) > 0 ||
  Boolean(policy?.disruptionBudget);

/**
 * Maps deltaGeneration form → RolloutPolicyDeltaGeneration.
 *
 * | Form state                | API output                                              |
 * | ------------------------- | ------------------------------------------------------- |
 * | Disabled                  | { generateDelta: false }                                |
 * | Enabled + default timing  | undefined (omit deltaGeneration block)                  |
 * | Enabled + custom timing   | { generateDelta: true, maxWait?, timeout? }             |
 */
export const toApiDeltaGeneration = (deltaForm: DeltaGenerationForm): RolloutPolicyDeltaGeneration | undefined => {
  if (!deltaForm.generateDelta) {
    return { generateDelta: false };
  }

  if (hasCustomDeltaTiming(deltaForm)) {
    const deltaGeneration: RolloutPolicyDeltaGeneration = { generateDelta: true };
    if (deltaForm.maxWaitForDelta) {
      deltaGeneration.maxWaitForDelta = deltaForm.maxWaitForDelta;
    }
    if (deltaForm.deltaGenerationTimeout) {
      deltaGeneration.deltaGenerationTimeout = deltaForm.deltaGenerationTimeout;
    }
    return deltaGeneration;
  }

  return undefined;
};

/** Whether the fleet spec should include rolloutPolicy (scheduling, delta opt-out, or custom timing). */
export const shouldIncludeRolloutPolicy = (fleetValues: FleetFormValues): boolean => {
  const hasCustomRolloutScheduling =
    fleetValues.updateMode === UpdateMode.Customized &&
    (fleetValues.rolloutPolicy.isCustomized || fleetValues.disruptionBudget.isCustomized);

  return (
    hasCustomRolloutScheduling ||
    !fleetValues.deltaGeneration.generateDelta ||
    hasCustomDeltaTiming(fleetValues.deltaGeneration)
  );
};

export const getDeltaGenerationValues = (fleetSpec?: FleetSpec): DeltaGenerationForm => {
  const deltaGeneration = fleetSpec?.rolloutPolicy?.deltaGeneration;
  const maxWaitForDelta = deltaGeneration?.maxWaitForDelta;
  const deltaGenerationTimeout = deltaGeneration?.deltaGenerationTimeout;

  return {
    isCustomized: Boolean(maxWaitForDelta || deltaGenerationTimeout),
    generateDelta: deltaGeneration?.generateDelta ?? true,
    maxWaitForDelta: maxWaitForDelta || '',
    deltaGenerationTimeout: deltaGenerationTimeout || '',
  };
};
