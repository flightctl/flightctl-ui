import { FlightCtlLabel } from '../types/extraTypes';

export const fromAPILabel = (labels: Record<string, string>): FlightCtlLabel[] =>
  Object.entries(labels).map((labelEntry) => ({
    key: labelEntry[0],
    value: labelEntry[1],
  }));

export const toAPILabel = (labels: FlightCtlLabel[]): Record<string, string> =>
  labels.reduce(
    (acc, curr) => {
      acc[curr.key] = curr.value || '';
      return acc;
    },
    {} as Record<string, string>,
  );
