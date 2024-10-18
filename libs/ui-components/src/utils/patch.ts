import { ApplicationSpec, PatchRequest } from '@flightctl/types';
import isNil from 'lodash/isNil';
import isEqual from 'lodash/isEqual';
import differenceWith from 'lodash/differenceWith';

import { FlightCtlLabel } from '../types/extraTypes';
import { toAPILabel } from './labels';
import { ApplicationFormSpec } from '../components/Device/EditDeviceWizard/types';

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
