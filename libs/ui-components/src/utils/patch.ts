import { ApplicationSpec, BatchSequence, PatchRequest, RolloutPolicy } from '@flightctl/types';
import isNil from 'lodash/isNil';
import isEqual from 'lodash/isEqual';
import differenceWith from 'lodash/differenceWith';

import { FlightCtlLabel } from '../types/extraTypes';
import { toAPILabel } from './labels';
import { ApplicationFormSpec } from '../components/Device/EditDeviceWizard/types';
import { BatchForm, BatchLimitType, RolloutPolicyForm } from '../components/Fleet/CreateFleet/types';

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
  } else {
    const hasDifferentItems = differenceWith(currentList, newList, isEqual).length > 0;

    if (newLen !== curLen || hasDifferentItems) {
      patches.push({
        path,
        op: 'replace',
        value: valueBuilder(newList),
      });
    }
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

const toApiDeviceSelection = (policyForm: RolloutPolicyForm): BatchSequence => {
  return {
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
  };
};

export const getRolloutPolicyData = (updatedPolicy: RolloutPolicyForm) => ({
  defaultUpdateTimeout: toApiDuration(updatedPolicy.updateTimeout),
  deviceSelection: toApiDeviceSelection(updatedPolicy),
});

export const getRolloutPolicyPatches = (
  currentPolicy: RolloutPolicy | undefined,
  updatedPolicy: RolloutPolicyForm,
): PatchRequest => {
  const currentBatches = currentPolicy?.deviceSelection?.sequence || [];
  const isCurrentlyActive = currentBatches.length > 0;

  if (isCurrentlyActive !== updatedPolicy.isActive) {
    return updatedPolicy.isActive
      ? [
          {
            op: 'add',
            path: '/spec/rolloutPolicy',
            value: getRolloutPolicyData(updatedPolicy),
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
      const updatedBatch = updatedPolicy.batches[index];
      if ((updatedBatch.limit || 0) !== (batch.limit || 0)) {
        return true;
      }
      if ((updatedBatch.successThreshold || 0) !== (batch.successThreshold || 0)) {
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

export const toAPIApplication = (app: ApplicationFormSpec): ApplicationSpec => {
  const envVars = app.variables.reduce((acc, variable) => {
    acc[variable.name] = variable.value;
    return acc;
  }, {});

  return app.name
    ? {
        name: app.name,
        image: app.image,
        envVars,
      }
    : {
        // Name must not be sent, otherwise the API expects it to have a value
        image: app.image,
        envVars,
      };
};

export const getApplicationPatches = (
  basePath: string,
  currentApps: ApplicationSpec[],
  updatedApps: ApplicationFormSpec[],
) => {
  const patches: PatchRequest = [];

  const currentLen = currentApps.length;
  const newLen = updatedApps.length;
  if (currentLen === 0 && newLen > 0) {
    // First apps(s) have been added
    patches.push({
      path: `${basePath}/applications`,
      op: 'add',
      value: updatedApps.map(toAPIApplication),
    });
  } else if (currentLen > 0 && newLen === 0) {
    // Last app(s) have been removed
    patches.push({
      path: `${basePath}/applications`,
      op: 'remove',
    });
  } else if (currentLen !== newLen) {
    patches.push({
      path: `${basePath}/applications`,
      op: 'replace',
      value: updatedApps.map(toAPIApplication),
    });
  } else {
    const needsPatch = currentApps.some((currentApp, index) => {
      const updatedApp = updatedApps[index];
      if (updatedApp.name !== currentApp.name || updatedApp.image !== currentApp.image) {
        return true;
      }
      const currentVars = Object.entries(currentApp.envVars || {});
      if (currentVars.length !== updatedApp.variables.length) {
        return true;
      }
      return updatedApp.variables.some((variable) => {
        const currentValue = currentApp.envVars ? currentApp.envVars[variable.name] : undefined;
        return !currentValue || currentValue !== variable.value;
      });
    });
    if (needsPatch) {
      patches.push({
        path: `${basePath}/applications`,
        op: 'replace',
        value: updatedApps.map(toAPIApplication),
      });
    }
  }

  return patches;
};
