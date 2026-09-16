import type {
  BatchSequence,
  DeviceUpdatePolicySpec,
  DisruptionBudget,
  PatchRequest,
  RolloutPolicy,
  RolloutPolicyDeltaGeneration,
  UpdateSchedule,
} from '@flightctl/types';
import isNil from 'lodash/isNil';
import isEqual from 'lodash/isEqual';

import { type FlightCtlLabel } from '../../types/extraTypes';
import { toAPILabel } from '../labels';
import {
  rolloutPolicyHasSchedulingFields,
  shouldIncludeRolloutPolicy,
  toApiDeltaGeneration,
} from '../../components/Fleet/CreateFleet/fleetSpecUtils';
import {
  type BatchForm,
  BatchLimitType,
  type DisruptionBudgetForm,
  type FleetFormValues,
  type RolloutPolicyForm,
  UpdateMode,
  type UpdatePolicyForm,
} from '../../types/deviceSpec';
import { getUpdateCronExpression, localDeviceTimezone, schedulesAreEqual } from '../time';

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
  if (isEqual(newValue, originalValue)) {
    return;
  }
  // For boolean values, we should never remove them, only set them to true or false
  // For other values, if newValue is falsy and originalValue exists, remove the field
  if (!newValue && originalValue && typeof newValue !== 'boolean') {
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
  strategy: 'BatchSequence',
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

const ROLLOUT_POLICY_PATH = '/spec/rolloutPolicy';
const DELTA_GENERATION_PATH = `${ROLLOUT_POLICY_PATH}/deltaGeneration`;

export const updatePolicyFormToApi = (form: Required<UpdatePolicyForm>) => {
  const downloadSchedule = {
    at: getUpdateCronExpression(form.downloadStartsAt, form.downloadScheduleMode, form.downloadWeekDays),
    startGraceDuration: form.downloadStartGraceDuration || '0s',
    timeZone: form.downloadTimeZone === localDeviceTimezone ? undefined : form.downloadTimeZone,
  };
  let updateSchedule: UpdateSchedule;
  if (form.downloadAndInstallDiffer) {
    updateSchedule = {
      at: getUpdateCronExpression(form.installStartsAt, form.installScheduleMode, form.installWeekDays),
      startGraceDuration: form.installStartGraceDuration || '0s',
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
  // Switching from default mode to customized mode or viceversa
  if (!currentPolicy) {
    return form.isCustomized
      ? ([
          {
            op: 'add',
            path: basePath,
            value: updatePolicyFormToApi(form),
          },
        ] as PatchRequest)
      : [];
  } else if (!form.isCustomized) {
    return [
      {
        op: 'remove',
        path: basePath,
      },
    ] as PatchRequest;
  }

  // Making changes to existing customized settings
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

const formWantsRolloutScheduling = (fleetValues: FleetFormValues): boolean =>
  fleetValues.updateMode === UpdateMode.Customized &&
  (fleetValues.rolloutPolicy.isCustomized || fleetValues.disruptionBudget.isCustomized);

export const getRolloutPolicyData = (fleetValues: FleetFormValues): RolloutPolicy => {
  const { rolloutPolicy, disruptionBudget, deltaGeneration, updateMode } = fleetValues;
  const newRolloutPolicy: RolloutPolicy = {};
  if (updateMode === UpdateMode.Customized) {
    if (rolloutPolicy.isCustomized) {
      newRolloutPolicy.defaultUpdateTimeout = toApiDuration(rolloutPolicy.updateTimeout);
      newRolloutPolicy.deviceSelection = toApiDeviceSelection(rolloutPolicy);
    }
    if (disruptionBudget.isCustomized) {
      newRolloutPolicy.disruptionBudget = toApiDisruptionBudget(disruptionBudget);
    }
  }
  newRolloutPolicy.deltaGeneration = toApiDeltaGeneration(deltaGeneration);
  return newRolloutPolicy;
};

const appendRolloutSchedulingRemovalPatches = (patches: PatchRequest, currentPolicy?: RolloutPolicy) => {
  const currentBatches = currentPolicy?.deviceSelection?.sequence || [];
  if (currentBatches.length > 0) {
    patches.push({
      path: `${ROLLOUT_POLICY_PATH}/deviceSelection`,
      op: 'remove',
    });
  }
  if (currentPolicy?.defaultUpdateTimeout !== undefined) {
    patches.push({
      path: `${ROLLOUT_POLICY_PATH}/defaultUpdateTimeout`,
      op: 'remove',
    });
  }
  if (currentPolicy?.disruptionBudget) {
    patches.push({
      path: `${ROLLOUT_POLICY_PATH}/disruptionBudget`,
      op: 'remove',
    });
  }
};

const appendRolloutSchedulingPatches = (
  patches: PatchRequest,
  currentPolicy: RolloutPolicy | undefined,
  fleetValues: FleetFormValues,
) => {
  if (!formWantsRolloutScheduling(fleetValues)) {
    if (rolloutPolicyHasSchedulingFields(currentPolicy)) {
      appendRolloutSchedulingRemovalPatches(patches, currentPolicy);
    }
    return;
  }

  const currentBatches = currentPolicy?.deviceSelection?.sequence || [];
  const currentDisruption = currentPolicy?.disruptionBudget;
  const updatedPolicy = fleetValues.rolloutPolicy;

  if (fleetValues.rolloutPolicy.isCustomized) {
    // The timeout will be always expressed in minutes
    const updatedTimeout = updatedPolicy.updateTimeout ? toApiDuration(updatedPolicy.updateTimeout) : '';
    if ((currentPolicy?.defaultUpdateTimeout || '') !== updatedTimeout) {
      appendJSONPatch({
        patches,
        originalValue: currentPolicy?.defaultUpdateTimeout,
        newValue: updatedTimeout,
        path: `${ROLLOUT_POLICY_PATH}/defaultUpdateTimeout`,
      });
    }

    if (currentBatches.length === updatedPolicy.batches.length) {
      const hasBatchChanges = currentBatches.some((batch, index) => {
        // The format of the numbers is different, we must convert them for comparison
        const updatedBatch = updatedPolicy.batches[index];
        if ((batch.limit || 0) !== (toApiLimit(updatedBatch) || 0)) {
          return true;
        }
        const updatedThreshold = updatedBatch.successThreshold ? `${updatedBatch.successThreshold}%` : '';
        if (updatedThreshold !== (batch.successThreshold || '')) {
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
          path: `${ROLLOUT_POLICY_PATH}/deviceSelection`,
          op: currentPolicy?.deviceSelection ? 'replace' : 'add',
          value: toApiDeviceSelection(updatedPolicy),
        });
      }
    } else {
      patches.push({
        path: `${ROLLOUT_POLICY_PATH}/deviceSelection`,
        op: currentPolicy?.deviceSelection ? 'replace' : 'add',
        value: toApiDeviceSelection(updatedPolicy),
      });
    }
  } else {
    if (currentBatches.length > 0) {
      patches.push({
        path: `${ROLLOUT_POLICY_PATH}/deviceSelection`,
        op: 'remove',
      });
    }
    if (currentPolicy?.defaultUpdateTimeout !== undefined) {
      patches.push({
        path: `${ROLLOUT_POLICY_PATH}/defaultUpdateTimeout`,
        op: 'remove',
      });
    }
  }

  if (fleetValues.disruptionBudget.isCustomized) {
    const hasMinChanged = (currentDisruption?.minAvailable || '') !== (fleetValues.disruptionBudget.minAvailable || '');
    const hasMaxChanged =
      (currentDisruption?.maxUnavailable || '') !== (fleetValues.disruptionBudget.maxUnavailable || '');

    const hasChanges =
      hasMinChanged ||
      hasMaxChanged ||
      listsHaveDifferences(currentDisruption?.groupBy || [], fleetValues.disruptionBudget.groupBy || []);

    if (hasChanges) {
      appendJSONPatch({
        path: `${ROLLOUT_POLICY_PATH}/disruptionBudget`,
        patches,
        originalValue: currentDisruption,
        newValue: toApiDisruptionBudget(fleetValues.disruptionBudget),
      });
    }
  } else if (currentDisruption) {
    patches.push({
      path: `${ROLLOUT_POLICY_PATH}/disruptionBudget`,
      op: 'remove',
    });
  }
};

const deltaGenerationFieldsMatch = (
  current: RolloutPolicyDeltaGeneration | undefined,
  target: RolloutPolicyDeltaGeneration | undefined,
): boolean => {
  if (!current && !target) {
    return true;
  }
  if (!current || !target) {
    return false;
  }
  return (
    current.generateDelta === target.generateDelta &&
    (current.maxWaitForDelta ?? undefined) === (target.maxWaitForDelta ?? undefined) &&
    (current.deltaGenerationTimeout ?? undefined) === (target.deltaGenerationTimeout ?? undefined)
  );
};

const appendDeltaGenerationPatches = (
  patches: PatchRequest,
  currentPolicy: RolloutPolicy,
  fleetValues: FleetFormValues,
) => {
  const targetDelta = toApiDeltaGeneration(fleetValues.deltaGeneration);
  const currentDelta = currentPolicy.deltaGeneration;

  if (deltaGenerationFieldsMatch(currentDelta, targetDelta)) {
    return;
  }

  if (!targetDelta) {
    if (currentDelta !== undefined) {
      patches.push({
        op: 'remove',
        path: DELTA_GENERATION_PATH,
      });
    }
    return;
  }

  if (!currentDelta) {
    patches.push({
      op: 'add',
      path: DELTA_GENERATION_PATH,
      value: targetDelta,
    });
    return;
  }

  appendJSONPatch({
    patches,
    originalValue: currentDelta.generateDelta,
    newValue: targetDelta.generateDelta,
    path: `${DELTA_GENERATION_PATH}/generateDelta`,
  });
  appendJSONPatch({
    patches,
    originalValue: currentDelta.maxWaitForDelta,
    newValue: targetDelta.maxWaitForDelta,
    path: `${DELTA_GENERATION_PATH}/maxWaitForDelta`,
  });
  appendJSONPatch({
    patches,
    originalValue: currentDelta.deltaGenerationTimeout,
    newValue: targetDelta.deltaGenerationTimeout,
    path: `${DELTA_GENERATION_PATH}/deltaGenerationTimeout`,
  });
};

export const getRolloutPolicyPatches = (
  currentPolicy: RolloutPolicy | undefined,
  fleetValues: FleetFormValues,
): PatchRequest => {
  const shouldExist = shouldIncludeRolloutPolicy(fleetValues);

  if (!currentPolicy && shouldExist) {
    return [
      {
        op: 'add',
        path: ROLLOUT_POLICY_PATH,
        value: getRolloutPolicyData(fleetValues),
      },
    ];
  }

  if (currentPolicy && !shouldExist) {
    return [
      {
        op: 'remove',
        path: ROLLOUT_POLICY_PATH,
      },
    ];
  }

  if (!currentPolicy) {
    return [];
  }

  const patches: PatchRequest = [];
  appendRolloutSchedulingPatches(patches, currentPolicy, fleetValues);
  appendDeltaGenerationPatches(patches, currentPolicy, fleetValues);
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
