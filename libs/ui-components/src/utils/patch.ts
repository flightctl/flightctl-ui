import { PatchRequest } from '@flightctl/types';
import isNil from 'lodash/isNil';
import uniq from 'lodash/uniq';
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
    const hasDifferentItems = uniq([...currentList, newList]).length !== curLen;
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

export const getLabelPatches = (basePath: string, currentLabels: Record<string, string>, newLabels: FlightCtlLabel[]) => {
  const patches: PatchRequest = [];

  const allKeys: string[] = Object.entries(currentLabels).map(([key]) => key);
  newLabels.forEach((newLabel) => {
    if (!allKeys.includes(newLabel.key)) {
      allKeys.push(newLabel.key);
    }
  });


  // TODO do at the higher level object?
  allKeys.forEach((labelKey) => {
    const newLabel = newLabels.find((newLabel) => newLabel.key === labelKey);

    // Valueless labels need to be considered separately - "appendJSONPatch" identifies no value as deleted entry
    const valuelessLabelRemoved = labelKey in currentLabels && !currentLabels[labelKey] && !newLabel;
    const labelIsNowValueless = labelKey in currentLabels && currentLabels[labelKey] && newLabel && !newLabel.value;

    const path = `${basePath}/${labelKey}`;
    if (valuelessLabelRemoved) {
      patches.push({
        path,
        op: 'remove',
      });
    } else if (labelIsNowValueless) {
      patches.push({
        path,
        op: 'replace',
        value: '',
      });
    } else {
      appendJSONPatch({
        path,
        patches,
        newValue: newLabel?.value || '',
        originalValue: currentLabels[labelKey] || '',
      });
    }
  });

  return patches;
};
