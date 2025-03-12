import { FlightCtlLabel } from '../types/extraTypes';

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

export const labelToExactApiMatchString = (label: FlightCtlLabel) => `${label.key}=${label.value || ''}`;
export const textToPartialApiMatchString = (text: string) => {
  if (text.includes('=')) {
    const [key, value] = text.split('=');
    return value ? `metadata.labels.key=${key},metadata.labels.value contains ${value}` : `metadata.label.key=${key}`;
  }
  return `metadata.labels.keyOrValue contains ${text}`;
};

export const labelToString = (label: FlightCtlLabel) => `${label.key}${label.value ? `=${label.value}` : ''}`;

export const stringToLabel = (labelStr: string): FlightCtlLabel => {
  const labelParts = labelStr.split('=');
  return {
    key: labelParts[0],
    value: labelParts.length > 1 ? labelParts[1] : undefined,
  };
};
