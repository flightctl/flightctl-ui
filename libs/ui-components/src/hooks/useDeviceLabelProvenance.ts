import * as React from 'react';

import type { Device, DeviceSystemInfo, LabelSyncProvenanceList } from '@flightctl/types';
import type { FlightCtlLabel } from '../types/extraTypes';
import { sanitizeLabelValue } from '../utils/labels';
import { useFetchPeriodically } from './useFetchPeriodically';

/**
 * How a managed label relates to systemInfo/customInfo (matched by field name after `/`):
 * - primary: a matching field exists and the sanitized value equals the label
 * - primary-mismatch: a matching field exists but the values differ (possible false positive; see UX)
 * - derived: no matching field in systemInfo/customInfo
 */
export type ManagedLabelKind = 'primary' | 'derived' | 'primary-mismatch';

export type ManagedLabel = FlightCtlLabel & {
  kind: ManagedLabelKind;
};

export type ManagedLabels = {
  items: ManagedLabel[];
  totalCount: number;
  primaryCount: number;
  derivedCount: number;
};

const emptyResult: ManagedLabels = {
  items: [],
  totalCount: 0,
  primaryCount: 0,
  derivedCount: 0,
};

const getMatchingSystemInfoValue = (labelKey: string, systemInfo: DeviceSystemInfo | undefined): unknown => {
  const labelParts = labelKey.split('/');
  const fieldName = labelParts.length === 1 ? labelKey : labelParts[1];
  // Use ?? so boolean false (e.g. deltaEligible) is not treated as missing.
  return systemInfo?.[fieldName] ?? systemInfo?.customInfo?.[fieldName];
};

// For example, "systeminfo.flightctl.io/hostname=abc" and "custominfo.flightctl.io/hostname=def"
// both match field "hostname". If systemInfo has { hostname: "abc" }, the first is primary and
// the second is primary-mismatch. A label with no matching field is derived.
const classifyManagedLabel = (
  labelEntry: [string, string],
  systemInfo: DeviceSystemInfo | undefined,
): ManagedLabelKind => {
  const [key, value] = labelEntry;
  const foundValue = getMatchingSystemInfoValue(key, systemInfo);

  if (foundValue === undefined || foundValue === null) {
    return 'derived';
  }

  // Labels store the sanitized form (API/agent SanitizeLabelValue); compare against that.
  const sanitizedFoundValue = sanitizeLabelValue(foundValue);
  return sanitizedFoundValue === value ? 'primary' : 'primary-mismatch';
};

const buildManagedLabels = (device: Device, managedLabelKeys: string[]): ManagedLabels => {
  const systemInfo = device.status?.systemInfo;

  const items: ManagedLabel[] = [];
  let primaryCount = 0;

  Object.entries(device.metadata.labels || {}).forEach((entry) => {
    const [key, value] = entry;
    if (managedLabelKeys.includes(key)) {
      const kind = classifyManagedLabel(entry, systemInfo);
      items.push({ key, value, kind });
      if (kind === 'primary') {
        primaryCount++;
      }
    }
  });

  return {
    items,
    primaryCount,
    derivedCount: items.length - primaryCount,
    totalCount: items.length,
  };
};

type DeviceLabelProvenance = {
  managedLabels: ManagedLabels;
  isLoading: boolean;
  error: unknown;
};

export const useDeviceLabelProvenance = (device: Device): DeviceLabelProvenance => {
  const deviceName = device.metadata.name || '';
  const [provenance, isLoading, error] = useFetchPeriodically<LabelSyncProvenanceList>({
    endpoint: deviceName ? `devices/${deviceName}/labelsyncprovenance` : '',
    timeout: 60000,
  });

  const managedLabels = React.useMemo(() => {
    if (!provenance) {
      return emptyResult;
    }
    const labelKeys = provenance.items.map((item) => item.key);
    return buildManagedLabels(device, labelKeys);
  }, [device, provenance]);

  return {
    managedLabels,
    isLoading: Boolean(deviceName) && isLoading,
    error,
  };
};

export default useDeviceLabelProvenance;
