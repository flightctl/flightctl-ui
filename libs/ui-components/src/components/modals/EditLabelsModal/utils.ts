import { PatchRequest } from '@flightctl/types';
import { FlightCtlLabel } from '../../../types/extraTypes';
import { appendJSONPatch } from '../../../utils/patch';

export const getLabelPatches = (currentLabels: Record<string, string>, newLabels: FlightCtlLabel[]) => {
  const patches: PatchRequest = [];

  const allKeys: string[] = Object.entries(currentLabels).map(([key]) => key);
  newLabels.forEach((newLabel) => {
    if (!allKeys.includes(newLabel.key)) {
      allKeys.push(newLabel.key);
    }
  });

  allKeys.forEach((labelKey) => {
    const newLabel = newLabels.find((newLabel) => newLabel.key === labelKey);

    // Valueless labels need to be considered separately - "appendJSONPatch" identifies no value as deleted entry
    const valuelessLabelRemoved = labelKey in currentLabels && !currentLabels[labelKey] && !newLabel;
    const labelIsNowValueless = labelKey in currentLabels && currentLabels[labelKey] && newLabel && !newLabel.value;

    const path = `/metadata/labels/${labelKey}`;
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
