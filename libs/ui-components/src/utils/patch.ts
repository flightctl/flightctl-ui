import {
  BatchSequence,
  DeviceUpdatePolicySpec,
  DisruptionBudget,
  PatchRequest,
  RolloutPolicy,
  RolloutStrategy,
  UpdateSchedule,
} from '@flightctl/types';
import isNil from 'lodash/isNil';

import { FlightCtlLabel } from '../types/extraTypes';
import { toAPILabel } from './labels';
import {
  BatchForm,
  BatchLimitType,
  DisruptionBudgetForm,
  FleetFormValues,
  RolloutPolicyForm,
  UpdatePolicyForm,
} from '../types/deviceSpec';
import { getStartGraceDuration, getUpdateCronExpression, localDeviceTimezone } from './time';

export const appendJSONPatch = <V = unknown>({
  patches,
  newValue,
  originalValue,
  path,
  encodeB64,
}: {
  patches: PatchRequest;
  newValue: V;
  originalValue: V;
  path: string;
  encodeB64?: boolean;
}) => {
  if (newValue === originalValue) {
    return;
  }
  if (!newValue && originalValue) {
    patches.push({
      op: 'remove',
      path,
    });
    return;
  }
  const value = encodeB64 ? btoa(newValue as string) : newValue;
  patches.push({
    op: isNil(originalValue) ? 'add' : 'replace',
    path,
    value,
  });
};

const listsHaveDifferences = (arr1: string[], arr2: string[]) => {
  if (arr1.length !== arr2.length) {
    return true;
  }
  return arr1.some((item1, index) => {
    return arr2[index] !== item1;
  });
};

export const getStringListPatches = (
  path: string,
  currentList: string[],
  newList: string[],
  valueBuilder: (value: string[]) => unknown,
) => {
  const patches: PatchRequest = [];

  const newLen = newList.length;
  const curLen = currentList.length;

  if (newLen === 0 && curLen > 0) {
    patches.push({
      path,
      op: 'remove',
    });
  } else if (newLen > 0 && curLen === 0) {
    patches.push({
      path,
      op: 'add',
      value: valueBuilder(newList),
    });
  } else if (newLen !== curLen || listsHaveDifferences(currentList, newList)) {
    patches.push({
      path,
      op: 'replace',
      value: valueBuilder(newList),
    });
  }

  return patches;
};

const toApiLimit = (formBatch: BatchForm) => {
  if (!formBatch.limit) {
    return undefined;
  }
  return formBatch.limitType === BatchLimitType.BatchLimitPercent ? `${formBatch.limit}%` : formBatch.limit;
};

const toApiDuration = (minutes: number) => {
  const hours = minutes / 60;
  if (hours % 1 === 0) {
    return `${hours}h`;
  }
  return `${minutes}m`;
};

const toApiDeviceSelection = (policyForm: RolloutPolicyForm): BatchSequence => ({
  strategy: RolloutStrategy.BatchSequence,
  sequence: policyForm.batches.map((formBatch) => {
    return {
      limit: toApiLimit(formBatch),
      successThreshold: formBatch.successThreshold ? `${formBatch.successThreshold}%` : undefined,
      selector: {
        matchLabels: toAPILabel(formBatch.selector || []),
      },
    };
  }),
});

const toApiDisruptionBudget = (disruptionValues: DisruptionBudgetForm) => {
  const data: DisruptionBudget = {
    groupBy: disruptionValues.groupBy || [],
  };
  if (typeof disruptionValues.minAvailable === 'number') {
    data.minAvailable = disruptionValues.minAvailable;
  }
  if (typeof disruptionValues.maxUnavailable === 'number') {
    data.maxUnavailable = disruptionValues.maxUnavailable;
  }

  return data;
};

export const schedulesAreEqual = (a: UpdateSchedule | undefined, b: UpdateSchedule | undefined) => {
  if (!a && !b) {
    return true;
  }
  if (!a || !b) {
    return false;
  }
  if (a.at !== b.at) {
    return false;
  }
  if ((a.timeZone || localDeviceTimezone) !== (b.timeZone || localDeviceTimezone)) {
    return false;
  }
  return (a.startGraceDuration || '0s') === (b.startGraceDuration || '0s');
};

export const updatePolicyFormToApi = (form: Required<UpdatePolicyForm>) => {
  const downloadSchedule = {
    at: getUpdateCronExpression(form.downloadStartsAt, form.downloadScheduleMode, form.downloadWeekDays),
    startGraceDuration: getStartGraceDuration(form.downloadStartsAt, form.downloadEndsAt),
    timeZone: form.downloadTimeZone === localDeviceTimezone ? undefined : form.downloadTimeZone,
  };
  let updateSchedule: UpdateSchedule;
  if (form.downloadAndInstallDiffer) {
    updateSchedule = {
      at: getUpdateCronExpression(form.installStartsAt, form.installScheduleMode, form.installWeekDays),
      startGraceDuration: getStartGraceDuration(form.installStartsAt, form.installEndsAt),
      timeZone: form.installTimeZone === localDeviceTimezone ? undefined : form.installTimeZone,
    };
  } else {
    updateSchedule = { ...downloadSchedule };
  }
  return {
    downloadSchedule,
    updateSchedule,
  };
};

export const getUpdatePolicyPatches = (
  basePath: string,
  currentPolicy: DeviceUpdatePolicySpec | undefined,
  form: Required<UpdatePolicyForm>,
): PatchRequest => {
  // Switching from basic mode to advanced or viceversa
  if (!currentPolicy) {
    return form.isAdvanced
      ? ([
          {
            op: 'add',
            path: basePath,
            value: updatePolicyFormToApi(form),
          },
        ] as PatchRequest)
      : [];
  } else if (!form.isAdvanced) {
    return [
      {
        op: 'remove',
        path: basePath,
      },
    ] as PatchRequest;
  }

  // Making changes to existing advaced settings
  const updatePatches: PatchRequest = [];
  const { downloadSchedule: newDownloadSched, updateSchedule: newInstallSched } = updatePolicyFormToApi(form);
  if (!schedulesAreEqual(currentPolicy.downloadSchedule, newDownloadSched)) {
    if (form.downloadAndInstallDiffer) {
      updatePatches.push({
        op: currentPolicy.downloadSchedule ? 'replace' : 'add',
        path: `${basePath}/downloadSchedule`,
        value: newDownloadSched,
      });
    } else {
      updatePatches.push({
        op: 'replace',
        path: basePath,
        value: {
          downloadSchedule: newDownloadSched,
          updateSchedule: newInstallSched,
        },
      });
    }
  } else if (!form.downloadAndInstallDiffer) {
    // DownloadSchedule did not change. Check if they just unchecked "useDifferent" and updateSchedule must be changed?
    if (!schedulesAreEqual(currentPolicy.updateSchedule, newDownloadSched)) {
      // Important: we are using downloadSchedule here since we don't copy settings from download to update when
      // the checkbox for "useDifferent" is unchecked
      updatePatches.push({
        op: currentPolicy.updateSchedule ? 'replace' : 'add',
        path: `${basePath}/updateSchedule`,
        value: newDownloadSched,
      });
    }
  }
  if (form.downloadAndInstallDiffer && !schedulesAreEqual(currentPolicy.updateSchedule, newInstallSched)) {
    updatePatches.push({
      op: currentPolicy.updateSchedule ? 'replace' : 'add',
      path: `${basePath}/updateSchedule`,
      value: newInstallSched,
    });
  }

  return updatePatches;
};

export const getRolloutPolicyData = ({ rolloutPolicy, disruptionBudget }: FleetFormValues) => {
  const newRolloutPolicy: RolloutPolicy = {};
  if (rolloutPolicy.isAdvanced) {
    newRolloutPolicy.defaultUpdateTimeout = toApiDuration(rolloutPolicy.updateTimeout);
    newRolloutPolicy.deviceSelection = toApiDeviceSelection(rolloutPolicy);
  }
  if (disruptionBudget.isAdvanced) {
    newRolloutPolicy.disruptionBudget = toApiDisruptionBudget(disruptionBudget);
  }
  return newRolloutPolicy;
};

export const getRolloutPolicyPatches = (
  currentPolicy: RolloutPolicy | undefined,
  fleetValues: FleetFormValues,
): PatchRequest => {
  const currentBatches = currentPolicy?.deviceSelection?.sequence || [];
  const currentDisruption = currentPolicy?.disruptionBudget;

  const hadAdvancedSettings = currentBatches.length > 0 || !!currentDisruption;
  const wantsAdvancedSettings =
    !fleetValues.useBasicUpdateConfig &&
    (fleetValues.rolloutPolicy.isAdvanced || fleetValues.disruptionBudget.isAdvanced);
  const updatedPolicy = fleetValues.rolloutPolicy;

  if (hadAdvancedSettings !== wantsAdvancedSettings) {
    return wantsAdvancedSettings
      ? [
          {
            op: 'add',
            path: '/spec/rolloutPolicy',
            value: getRolloutPolicyData(fleetValues),
          },
        ]
      : [
          {
            op: 'remove',
            path: '/spec/rolloutPolicy',
          },
        ];
  }

  const patches: PatchRequest = [];
  if (fleetValues.rolloutPolicy.isAdvanced) {
    // The timeout will be always expressed in minutes
    if ((currentPolicy?.defaultUpdateTimeout || '') !== (updatedPolicy.updateTimeout || '')) {
      appendJSONPatch({
        patches,
        originalValue: currentPolicy?.defaultUpdateTimeout,
        newValue: toApiDuration(updatedPolicy.updateTimeout),
        path: '/spec/rolloutPolicy/defaultUpdateTimeout',
      });
    }
    if (currentBatches.length === updatedPolicy.batches.length) {
      const hasBatchChanges = currentBatches.some((batch, index) => {
        // The format of the numbers is different, we must convert them for comparison
        const updatedBatch = updatedPolicy.batches[index];
        if ((batch.limit || 0) !== (toApiLimit(updatedBatch) || 0)) {
          return true;
        }
        const updatedThreshold = updatedBatch.successThreshold ? `${updatedBatch.successThreshold}%` : 0;
        if (updatedThreshold !== (batch.successThreshold || 0)) {
          return true;
        }
        const labelPatches = getLabelPatches('labels', batch.selector?.matchLabels || {}, updatedBatch.selector);
        if (labelPatches.length > 0) {
          return true;
        }
        return false;
      });
      if (hasBatchChanges) {
        patches.push({
          path: '/spec/rolloutPolicy/deviceSelection',
          op: 'replace',
          value: toApiDeviceSelection(updatedPolicy),
        });
      }
    } else {
      patches.push({
        path: '/spec/rolloutPolicy/deviceSelection',
        op: 'replace',
        value: toApiDeviceSelection(updatedPolicy),
      });
    }
  } else if (currentBatches.length > 0) {
    patches.push({
      path: '/spec/rolloutPolicy/deviceSelection',
      op: 'remove',
    });
    patches.push({
      path: '/spec/rolloutPolicy/defaultUpdateTimeout',
      op: 'remove',
    });
  }

  if (fleetValues.disruptionBudget.isAdvanced) {
    const hasMinChanged = (currentDisruption?.minAvailable || '') !== (fleetValues.disruptionBudget.minAvailable || '');
    const hasMaxChanged =
      (currentDisruption?.maxUnavailable || '') !== (fleetValues.disruptionBudget.maxUnavailable || '');

    const hasChanges =
      hasMinChanged ||
      hasMaxChanged ||
      listsHaveDifferences(currentDisruption?.groupBy || [], fleetValues.disruptionBudget.groupBy || []);

    if (hasChanges) {
      appendJSONPatch({
        path: '/spec/rolloutPolicy/disruptionBudget',
        patches,
        originalValue: currentDisruption,
        newValue: fleetValues.disruptionBudget.isAdvanced
          ? toApiDisruptionBudget(fleetValues.disruptionBudget)
          : undefined,
      });
    }
  } else if (currentDisruption?.minAvailable || currentDisruption?.maxUnavailable) {
    patches.push({
      path: '/spec/rolloutPolicy/disruptionBudget',
      op: 'remove',
    });
  }
  return patches;
};

export const getLabelPatches = (
  basePath: string,
  currentLabels: Record<string, string>,
  newLabels: FlightCtlLabel[],
) => {
  const patches: PatchRequest = [];
  const currentLen = Object.keys(currentLabels).length;
  const newLen = newLabels.length;

  const newLabelMap = toAPILabel(newLabels);

  if (currentLen === 0 && newLen > 0) {
    // First label(s) have been added
    patches.push({
      path: basePath,
      op: 'add',
      value: newLabelMap,
    });
  } else if (currentLen > 0 && newLen === 0) {
    // Last label(s) have been removed
    patches.push({
      path: basePath,
      op: 'remove',
    });
  } else if (currentLen !== newLen) {
    patches.push({
      path: basePath,
      op: 'replace',
      value: newLabelMap,
    });
  } else {
    const needsPatch = Object.entries(newLabelMap).some(([key, value]) => {
      if (!(key in currentLabels)) {
        // A new label has been added
        return true;
      } else if (currentLabels[key] !== value) {
        // An existing label has changed its value
        return true;
      }
      return false;
    });
    if (needsPatch) {
      patches.push({
        path: basePath,
        op: 'replace',
        value: newLabelMap,
      });
    }
  }
  return patches;
};

export const getDeviceLabelPatches = (
  currentLabels: Record<string, string>,
  newLabels: FlightCtlLabel[],
  newAlias?: string,
) => {
  let allNewLabels = newLabels;

  const currentAlias = newAlias || currentLabels['alias']; // The "alias" label is not allowed for devices, we need to add it back
  if (currentAlias) {
    allNewLabels = newLabels.concat([{ key: 'alias', value: currentAlias }]);
  }
  return getLabelPatches('/metadata/labels', currentLabels, allNewLabels);
};
