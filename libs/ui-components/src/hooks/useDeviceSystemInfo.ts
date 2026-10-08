import type { TFunction } from 'react-i18next';

import type { DeviceSystemInfo, DeviceSystemInfoStatuses, SystemInfoSourceStatus } from '@flightctl/types';
import { SystemInfoSourceStatusType } from '@flightctl/types';
import { timeSinceText } from '../utils/dates';

export type SystemInfoReporting = {
  status: SystemInfoSourceStatusType;
  timeSince?: string;
  error?: string;
};

export type SystemInfoEntry = {
  key: string;
  title: string;
  value: string | undefined;
  reporting: SystemInfoReporting | null;
};

export type CustomInfoListResult = {
  entries: SystemInfoEntry[];
  hasErrors: boolean;
};

export type SystemInfoSplitResult = {
  mainEntries: SystemInfoEntry[];
  hasMainErrors: boolean;
  expandEntries: SystemInfoEntry[];
  hasExpandErrors: boolean;
};

export type DeviceSystemInfoResult = {
  systemInfo: SystemInfoSplitResult;
  customInfo: CustomInfoListResult;
};

// By default only show the first 4 fields, with the rest shown in an expandable section.
// However, if there are less than 8 fields, show all of them without needing to expand.
const EXPAND_SYSTEM_INFO_COUNT = 4;
const MIN_SYSTEM_INFO_FIELDS_FOR_EXPAND = 8;

// Converts a camelCase variable into words. Example: "someInfoData" --> "Some info data"
// Keeps acronyms together, converted to lowercase. Example: "bootID" --> Boot id
const propNameToTitle = (input: string) => {
  const words = input.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2');
  return words.charAt(0).toUpperCase() + words.slice(1).toLowerCase();
};

const excludedKnownProps = [
  'customInfo', // Custom properies are evaluated separately from the predefined, known properties
  'attestation', // In Phase1 this includes only the raw data, without a report of success or failure.
  // exclude all fields reported as part of the capabilities section
  'deltaEligible',
  'bootcVersion',
  'ociDeltaVersion',
  'kvm',
  'gpus',
  'osMode',
];

const systemInfoKnownKeys = [
  'agentVersion',
  'operatingSystem',
  'hostname',
  'tpmVendorInfo',
  'architecture',
  'distroName',
  'distroVersion',
  'bootID',
  'kernel',
  'netInterfaceDefault',
  'netIpDefault',
  'netMacDefault',
  'productName',
  'productSerial',
  'productUuid',
];

const hasReportingError = (entryReport: SystemInfoReporting | null): boolean =>
  entryReport?.status === SystemInfoSourceStatusType.SystemInfoSourceStatusError || !!entryReport?.error;

const toReporting = (sourceStatus: SystemInfoSourceStatus | undefined, t: TFunction): SystemInfoReporting | null => {
  if (!sourceStatus) {
    return null;
  }
  const timeSince = timeSinceText(t, sourceStatus.lastTransitionTime);
  return {
    status: sourceStatus.status,
    timeSince: timeSince === 'N/A' ? undefined : timeSince,
    error: sourceStatus.message,
  };
};

const emptyListResult = {
  entries: [],
  hasErrors: false,
};

const emptyCombinedResult: DeviceSystemInfoResult = {
  systemInfo: {
    mainEntries: [],
    hasMainErrors: false,
    expandEntries: [],
    hasExpandErrors: false,
  },
  customInfo: emptyListResult,
};

const addEntry = (result: SystemInfoSplitResult, entry: SystemInfoEntry, totalLen: number, split?: boolean) => {
  const hasNewError = hasReportingError(entry.reporting);
  if (!split || totalLen <= MIN_SYSTEM_INFO_FIELDS_FOR_EXPAND || result.mainEntries.length < EXPAND_SYSTEM_INFO_COUNT) {
    result.mainEntries.push(entry);
    result.hasMainErrors = result.hasMainErrors || hasNewError;
  } else {
    result.expandEntries.push(entry);
    result.hasExpandErrors = result.hasExpandErrors || hasNewError;
  }
};

// Guard against newly added fields that are object-like values.
// The field should either be excluded, or displayed to a separate section with more advanced display logic.
const getDisplayValue = (value: string | undefined) => {
  if (typeof value === 'object' && value !== null) {
    return 'N/A';
  }
  return value;
};

const buildSystemInfoList = (
  t: TFunction,
  systemInfo: DeviceSystemInfo,
  infoStatus?: Record<string, SystemInfoSourceStatus>,
  split?: boolean,
): SystemInfoSplitResult => {
  const includedKeys = new Set<string>();

  const systemInfoKeys = Object.keys(systemInfo);
  const statusKeys = Object.keys(infoStatus || {});
  // Count displayable fields: value keys and status-only keys, excluding nested/special props.
  const totalLen = new Set([...systemInfoKeys, ...statusKeys].filter((key) => !excludedKnownProps.includes(key))).size;
  const result = {
    mainEntries: [],
    hasMainErrors: false,
    expandEntries: [],
    hasExpandErrors: false,
  };

  // Add the known fields first, in their desired order of appearance
  systemInfoKnownKeys
    .filter((infoKey) => systemInfo[infoKey] || !!infoStatus?.[infoKey])
    .forEach((infoKey) => {
      includedKeys.add(infoKey);
      addEntry(
        result,
        {
          key: infoKey,
          title: propNameToTitle(infoKey),
          value: systemInfo[infoKey],
          reporting: toReporting(infoStatus?.[infoKey], t),
        },
        totalLen,
        split,
      );
    });

  // Add any other fields that weren't included yet, in arbitrary order
  systemInfoKeys.forEach((infoKey) => {
    if (includedKeys.has(infoKey) || excludedKnownProps.includes(infoKey)) {
      return;
    }
    const value = systemInfo[infoKey];
    const itemStatus = infoStatus?.[infoKey];
    if (!value && !itemStatus) {
      return;
    }
    includedKeys.add(infoKey);
    addEntry(
      result,
      {
        key: infoKey,
        title: propNameToTitle(infoKey),
        value: getDisplayValue(value),
        reporting: toReporting(infoStatus?.[infoKey], t),
      },
      totalLen,
      split,
    );
  });

  // Include status-only fields that have no value yet (key present only in statusInfo)
  statusKeys.forEach((infoKey) => {
    if (includedKeys.has(infoKey) || excludedKnownProps.includes(infoKey)) {
      return;
    }
    includedKeys.add(infoKey);
    addEntry(
      result,
      {
        key: infoKey,
        title: propNameToTitle(infoKey),
        value: getDisplayValue(systemInfo[infoKey]),
        reporting: toReporting(infoStatus?.[infoKey], t),
      },
      totalLen,
      split,
    );
  });

  return result;
};

const buildCustomInfoList = (
  t: TFunction,
  customInfo: Record<string, string> | undefined,
  infoStatus?: Record<string, SystemInfoSourceStatus>,
): CustomInfoListResult => {
  const result: CustomInfoListResult = {
    entries: [],
    hasErrors: false,
  };

  const keys = new Set([...Object.keys(customInfo || {}), ...Object.keys(infoStatus || {})]);
  keys.forEach((key) => {
    const reporting = toReporting(infoStatus?.[key], t);
    if (hasReportingError(reporting)) {
      result.hasErrors = true;
    }
    result.entries.push({
      key,
      title: propNameToTitle(key),
      value: customInfo?.[key],
      reporting,
    });
  });

  return result;
};

export const useDeviceSystemInfo = (
  t: TFunction,
  systemInfo: DeviceSystemInfo | undefined,
  infoStatuses?: DeviceSystemInfoStatuses,
  split?: boolean,
): DeviceSystemInfoResult => {
  if (!systemInfo) {
    return emptyCombinedResult;
  }

  const systemInfoList = buildSystemInfoList(t, systemInfo, infoStatuses?.systemInfo, split);
  const customInfoList = buildCustomInfoList(t, systemInfo.customInfo, infoStatuses?.customInfo);

  return {
    systemInfo: systemInfoList,
    customInfo: customInfoList,
  };
};
