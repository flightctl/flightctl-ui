import { Device } from '@flightctl/types';
import { FlightCtlLabel } from '../types/extraTypes';
import { fuzzySeach } from './search';

type LabelOptions = {
  isDefault?: boolean;
};

export const fromAPILabel = (labels: Record<string, string>, options?: LabelOptions): FlightCtlLabel[] =>
  Object.entries(labels).map((labelEntry) => ({
    key: labelEntry[0],
    value: labelEntry[1],
    isDefault: options?.isDefault || false,
  }));

export const toAPILabel = (labels: FlightCtlLabel[]): Record<string, string> =>
  labels.reduce(
    (acc, curr) => {
      if (!curr.isDefault) {
        acc[curr.key] = curr.value || '';
      }
      return acc;
    },
    {} as Record<string, string>,
  );

export const labelToString = (label: FlightCtlLabel) => `${label.key}${label.value ? `=${label.value}` : ''}`;
export const stringToLabel = (labelStr: string): FlightCtlLabel => {
  const labelParts = labelStr.split('=');
  return {
    key: labelParts[0],
    value: labelParts.length > 1 ? labelParts[1] : undefined,
  };
};

export const filterDevicesLabels = (devices: Device[], additionalLabels: FlightCtlLabel[], filter: string) => {
  const filteredLabels = [
    ...new Set(
      [
        ...devices.reduce((acc, curr) => {
          const deviceLabels = curr.metadata.labels || {};
          acc.push(...fromAPILabel(deviceLabels));
          return acc;
        }, [] as FlightCtlLabel[]),
        ...additionalLabels,
      ].map(labelToString),
    ),
  ]
    .sort()
    .filter((label) => fuzzySeach(filter, label));
  return filteredLabels;
};
