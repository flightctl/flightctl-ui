import { PatchRequest } from '@flightctl/types';
import isNil from 'lodash/isNil';
import isEqual from 'lodash/isEqual';
import differenceWith from 'lodash/differenceWith';

import { FlightCtlLabel } from '../types/extraTypes';

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

  const allKeys: string[] = Object.entries(currentLabels).map(([key]) => key);
  newLabels.forEach((newLabel) => {
    if (!allKeys.includes(newLabel.key)) {
      allKeys.push(newLabel.key);
    }
  });

  const currentLen = Object.keys(currentLabels).length;
  const newLen = newLabels.length;

  const newLabelMap = newLabels.reduce((acc, label) => {
    const newAcc = { ...acc };
    newAcc[label.key] = label.value || '';
    return newAcc;
  }, {});

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
    let needsPatch = false;
    Object.entries(newLabelMap).forEach(([key, value]) => {
      if (!(key in currentLabels)) {
        // A new label has been added
        needsPatch = true;
      } else if (currentLabels[key] !== value) {
        // An existing label has changed its value
        needsPatch = true;
      }
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
