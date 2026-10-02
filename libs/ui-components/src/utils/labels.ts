import { type FlightCtlLabel } from '../types/extraTypes';

/** Kubernetes label value max length (k8s.io/apimachinery/pkg/util/validation). */
const LABEL_VALUE_MAX_LENGTH = 63;

const isAlphanumeric = (char: string) => /[A-Za-z0-9]/.test(char);

/**
 * Coerce systemInfo/CEL scalar values to string the same way the API does before SanitizeLabelValue
 * (bool → "true"/"false", numbers → decimal string).
 */
const toSanitizableString = (value: unknown): string => {
  if (value === null || value === undefined) {
    return '';
  }
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) {
      return '';
    }
    return String(value);
  }
  return '';
};

/**
 * Ports flightctl `validation.SanitizeLabelValue` (agent + LabelSyncMapping).
 * Converts an arbitrary value into a valid Kubernetes label value, or "" if impossible.
 * Accepts non-strings (e.g. systemInfo.deltaEligible boolean) by stringifying first.
 */
export const sanitizeLabelValue = (value: unknown): string => {
  try {
    const raw = toSanitizableString(value);
    if (!raw) {
      return '';
    }

    // Replace invalid characters with hyphen. Valid: A-Z, a-z, 0-9, -, _, .
    let sanitized = '';
    for (const char of raw) {
      sanitized += isAlphanumeric(char) || char === '-' || char === '_' || char === '.' ? char : '-';
    }

    // Trim non-alphanumeric characters from start and end
    let start = 0;
    let end = sanitized.length;
    while (start < end && !isAlphanumeric(sanitized[start])) {
      start++;
    }
    while (end > start && !isAlphanumeric(sanitized[end - 1])) {
      end--;
    }
    sanitized = sanitized.slice(start, end);

    if (sanitized.length > LABEL_VALUE_MAX_LENGTH) {
      sanitized = sanitized.slice(0, LABEL_VALUE_MAX_LENGTH);
      while (sanitized.length > 0 && !isAlphanumeric(sanitized[sanitized.length - 1])) {
        sanitized = sanitized.slice(0, -1);
      }
    }

    // Mirror k8s IsValidLabelValue safety check after transforms
    if (!/^(([A-Za-z0-9][-A-Za-z0-9_.]*)?[A-Za-z0-9])?$/.test(sanitized)) {
      return '';
    }

    return sanitized;
  } catch {
    return String(value);
  }
};

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
