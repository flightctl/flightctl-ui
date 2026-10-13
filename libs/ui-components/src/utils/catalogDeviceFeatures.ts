import { OsModeType } from '@flightctl/types';
import { DeviceFeatureBoolean, type DeviceFeatures } from '@flightctl/types/alpha';

import type { DeviceFeatureFilter, DeviceFeatureId } from './status/devices';

export const DEVICE_FEATURE_GPU_PRESENT = 'gpu.present';
export const DEVICE_FEATURE_KVM_ENABLED = 'kvm.enabled';
export const DEVICE_FEATURE_OS_MODE = 'os.mode';

const DEVICE_FEATURE_LABEL_PREFIX = 'feature.flightctl.io/';
export const DEVICE_FEATURE_LABEL_GPU_PRESENT = `${DEVICE_FEATURE_LABEL_PREFIX}${DEVICE_FEATURE_GPU_PRESENT}`;
export const DEVICE_FEATURE_LABEL_KVM_ENABLED = `${DEVICE_FEATURE_LABEL_PREFIX}${DEVICE_FEATURE_KVM_ENABLED}`;
export const DEVICE_FEATURE_LABEL_OS_MODE = `${DEVICE_FEATURE_LABEL_PREFIX}${DEVICE_FEATURE_OS_MODE}`;

export type DeviceFeatureBooleanFormValue = '' | DeviceFeatureBoolean;
export type DeviceFeatureOsModeFormValue = '' | OsModeType;

export type DeviceFeaturesFormValues = {
  gpuPresent: DeviceFeatureBooleanFormValue;
  kvmEnabled: DeviceFeatureBooleanFormValue;
  osMode: DeviceFeatureOsModeFormValue;
};

export const getEmptyDeviceFeaturesFormValues = (): DeviceFeaturesFormValues => ({
  gpuPresent: '',
  kvmEnabled: '',
  osMode: '',
});

const getFeatureBoolean = (value: unknown): DeviceFeatureBoolean | undefined => {
  if (
    value === DeviceFeatureBoolean.DeviceFeatureBooleanTrue ||
    value === DeviceFeatureBoolean.DeviceFeatureBooleanFalse
  ) {
    return value;
  }
  if (typeof value === 'boolean') {
    return value ? DeviceFeatureBoolean.DeviceFeatureBooleanTrue : DeviceFeatureBoolean.DeviceFeatureBooleanFalse;
  }
  return undefined;
};

const getFeatureOsMode = (value: unknown): OsModeType | undefined => {
  if (value === OsModeType.OsModeImage) {
    return OsModeType.OsModeImage;
  }
  if (value === OsModeType.OsModePackage) {
    return OsModeType.OsModePackage;
  }
  return undefined;
};

export const deviceFeaturesFromApi = (features?: DeviceFeatures | null): DeviceFeaturesFormValues | null => {
  if (!features) {
    return null;
  }

  const form = getEmptyDeviceFeaturesFormValues();
  let hasSetFeatures = false;

  const gpuPresent = getFeatureBoolean(features[DEVICE_FEATURE_GPU_PRESENT]);
  if (gpuPresent) {
    form.gpuPresent = gpuPresent;
    hasSetFeatures = true;
  }
  const kvmEnabled = getFeatureBoolean(features[DEVICE_FEATURE_KVM_ENABLED]);
  if (kvmEnabled) {
    form.kvmEnabled = kvmEnabled;
    hasSetFeatures = true;
  }
  const osMode = getFeatureOsMode(features[DEVICE_FEATURE_OS_MODE]);
  if (osMode) {
    form.osMode = osMode;
    hasSetFeatures = true;
  }

  return hasSetFeatures ? form : null;
};

const KNOWN_DEVICE_FEATURE_KEYS = new Set([
  DEVICE_FEATURE_GPU_PRESENT,
  DEVICE_FEATURE_KVM_ENABLED,
  DEVICE_FEATURE_OS_MODE,
]);

type RequirementValue = DeviceFeatureBoolean | OsModeType;

export const deviceFeaturesToApi = (
  form: DeviceFeaturesFormValues | null,
  original?: DeviceFeatures | null,
): DeviceFeatures | undefined => {
  const result: DeviceFeatures = {};

  // Preserve arbitrary features definitions. These are not shown and cannot be managed via the UI.
  if (original) {
    Object.entries(original).forEach(([key, value]) => {
      if (
        !KNOWN_DEVICE_FEATURE_KEYS.has(key) &&
        (value === DeviceFeatureBoolean.DeviceFeatureBooleanTrue ||
          value === DeviceFeatureBoolean.DeviceFeatureBooleanFalse)
      ) {
        result[key] = value as DeviceFeatureBoolean;
      }
    });
  }

  if (form?.gpuPresent) {
    result[DEVICE_FEATURE_GPU_PRESENT] = form.gpuPresent;
  }
  if (form?.kvmEnabled) {
    result[DEVICE_FEATURE_KVM_ENABLED] = form.kvmEnabled;
  }
  if (form?.osMode) {
    result[DEVICE_FEATURE_OS_MODE] = form.osMode;
  }
  return Object.keys(result).length > 0 ? result : undefined;
};

const featureFilterMap: Record<string, DeviceFeatureId> = {
  [DEVICE_FEATURE_GPU_PRESENT]: 'gpuPresent',
  [DEVICE_FEATURE_KVM_ENABLED]: 'kvmEnabled',
  [DEVICE_FEATURE_OS_MODE]: 'osMode',
};

export const deviceFeaturesToFilters = (features?: DeviceFeatures): DeviceFeatureFilter[] | null => {
  if (!features) {
    return null;
  }

  const activeFilters: DeviceFeatureFilter[] = [];

  Object.entries(features).forEach(([featureId, val]) => {
    const filterId = featureFilterMap[featureId];
    if (!filterId || !val) {
      return;
    }

    let filterObj = activeFilters.find((filter) => filter.fieldId === filterId);
    if (!filterObj) {
      filterObj = { fieldId: filterId, values: [] };
    }

    let boolValue: DeviceFeatureBoolean | undefined;
    if (featureId === DEVICE_FEATURE_OS_MODE) {
      if (val === OsModeType.OsModeImage) {
        boolValue = DeviceFeatureBoolean.DeviceFeatureBooleanTrue;
      } else if (val === OsModeType.OsModePackage) {
        boolValue = DeviceFeatureBoolean.DeviceFeatureBooleanFalse;
      }
    } else {
      boolValue = getFeatureBoolean(val);
    }
    if (boolValue) {
      filterObj.values.push(boolValue);
      if (filterObj.values.length === 1) {
        activeFilters.push(filterObj);
      }
    }
  });
  return activeFilters.length > 0 ? activeFilters : null;
};

/** Merge feature filters by fieldId; later lists override earlier ones for the same field. */
export const mergeDeviceFeatureFilters = (
  ...filterLists: (DeviceFeatureFilter[] | undefined)[]
): DeviceFeatureFilter[] => {
  const byField = new Map<DeviceFeatureId, DeviceFeatureFilter>();
  filterLists.forEach((filters) => {
    filters?.forEach((filter) => {
      byField.set(filter.fieldId, filter);
    });
  });
  return Array.from(byField.values());
};

/** Union deviceFeatures from multiple catalog versions; throws when the same key has conflicting values. */
export const mergeDeviceFeatures = (
  ...featuresList: Array<DeviceFeatures | undefined | null>
): DeviceFeatures | undefined => {
  const merged: DeviceFeatures = {};
  let hasEntries = false;
  featuresList.forEach((features) => {
    if (!features) {
      return;
    }
    Object.entries(features).forEach(([key, value]) => {
      if (!value) {
        return;
      }
      if (key in merged && merged[key] !== value) {
        throw new Error(`Contradictory device feature requirements for "${key}"`);
      }
      merged[key] = value as RequirementValue;
      hasEntries = true;
    });
  });
  return hasEntries ? merged : undefined;
};
