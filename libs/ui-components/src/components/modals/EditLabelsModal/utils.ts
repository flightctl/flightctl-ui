import { PatchRequest } from '@flightctl/types';
import { FlightCtlLabel } from '../../../types/extraTypes';
import { appendJSONPatch } from '../../../utils/patch';

export const getLabelPatches = (newLabels: FlightCtlLabel[], currentLabels: Record<string, string>) => {
  const patches: PatchRequest = [];

  const allKeys: string[] = Object.entries(currentLabels).map(([key]) => key);
  newLabels.forEach((newLabel) => {
    if (!currentLabels[newLabel.key]) {
      allKeys.push(newLabel.key);
    }
  });

  allKeys.forEach((labelKey) => {
    appendJSONPatch({
      patches,
      newValue: newLabels.find((newLabel) => newLabel.key === labelKey)?.value,
      originalValue: currentLabels[labelKey],
      path: `/metadata/labels/${labelKey}`,
    });
  });

  return patches;
};
