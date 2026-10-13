import { describe, expect, it } from 'vitest';
import { DeviceFeatureBoolean } from '@flightctl/types/alpha';

import {
  DEVICE_FEATURE_LABEL_GPU_PRESENT,
  DEVICE_FEATURE_LABEL_KVM_ENABLED,
  DEVICE_FEATURE_LABEL_OS_MODE,
} from './catalogDeviceFeatures';
import { buildDeviceFeatureLabelSelectors, commonQueries, setLabelParams } from './query';
import {
  type DeviceFeatureFilter,
  FilterSearchParams,
  UNKNOWN_CAPABILITY_VALUE,
  updateFeatureFilterValues,
} from './status/devices';

const withFeatures = (selected: Record<string, string[]>): DeviceFeatureFilter[] =>
  Object.entries(selected).reduce(
    (filters, [field, values]) => updateFeatureFilterValues(filters, field, values),
    [] as DeviceFeatureFilter[],
  );

describe('buildDeviceFeatureLabelSelectors', () => {
  it.each([
    {
      name: 'When no features are selected it should return no selectors',
      filters: [],
      expected: [],
    },
    {
      name: 'When only image OS mode is selected it should match the image label',
      filters: withFeatures({ [FilterSearchParams.OsMode]: [DeviceFeatureBoolean.DeviceFeatureBooleanTrue] }),
      expected: [`${DEVICE_FEATURE_LABEL_OS_MODE}=image`],
    },
    {
      name: 'When image and package OS modes are selected it should require the OS mode label to exist',
      filters: withFeatures({
        [FilterSearchParams.OsMode]: [
          DeviceFeatureBoolean.DeviceFeatureBooleanTrue,
          DeviceFeatureBoolean.DeviceFeatureBooleanFalse,
        ],
      }),
      expected: [DEVICE_FEATURE_LABEL_OS_MODE],
    },
    {
      name: 'When only unknown OS mode is selected it should require the OS mode label to be absent',
      filters: withFeatures({ [FilterSearchParams.OsMode]: [UNKNOWN_CAPABILITY_VALUE] }),
      expected: [`!${DEVICE_FEATURE_LABEL_OS_MODE}`],
    },
    {
      name: 'When image and unknown OS modes are selected it should exclude package',
      filters: withFeatures({
        [FilterSearchParams.OsMode]: [DeviceFeatureBoolean.DeviceFeatureBooleanTrue, UNKNOWN_CAPABILITY_VALUE],
      }),
      expected: [`${DEVICE_FEATURE_LABEL_OS_MODE}!=package`],
    },
    {
      name: 'When every OS mode is selected it should omit the OS mode selector',
      filters: withFeatures({
        [FilterSearchParams.OsMode]: [
          DeviceFeatureBoolean.DeviceFeatureBooleanTrue,
          DeviceFeatureBoolean.DeviceFeatureBooleanFalse,
          UNKNOWN_CAPABILITY_VALUE,
        ],
      }),
      expected: [],
    },
    {
      name: 'When GPU is present and KVM is enabled it should AND both labels',
      filters: withFeatures({
        [FilterSearchParams.GpuPresent]: [DeviceFeatureBoolean.DeviceFeatureBooleanTrue],
        [FilterSearchParams.KvmEnabled]: [DeviceFeatureBoolean.DeviceFeatureBooleanTrue],
      }),
      expected: [`${DEVICE_FEATURE_LABEL_GPU_PRESENT}=true`, `${DEVICE_FEATURE_LABEL_KVM_ENABLED}=true`],
    },
    {
      name: 'When GPU true and GPU unknown are selected it should exclude GPU false',
      filters: withFeatures({
        [FilterSearchParams.GpuPresent]: [DeviceFeatureBoolean.DeviceFeatureBooleanTrue, UNKNOWN_CAPABILITY_VALUE],
      }),
      expected: [`${DEVICE_FEATURE_LABEL_GPU_PRESENT}!=false`],
    },
    {
      name: 'When GPU true and GPU false are selected it should require the GPU label to exist',
      filters: withFeatures({
        [FilterSearchParams.GpuPresent]: [
          DeviceFeatureBoolean.DeviceFeatureBooleanTrue,
          DeviceFeatureBoolean.DeviceFeatureBooleanFalse,
        ],
      }),
      expected: [DEVICE_FEATURE_LABEL_GPU_PRESENT],
    },
  ])('$name', ({ filters, expected }) => {
    expect(buildDeviceFeatureLabelSelectors(filters)).toEqual(expected);
  });
});

describe('setLabelParams', () => {
  it('When user labels and feature selectors are set it should AND them in labelSelector', () => {
    const params = new URLSearchParams();
    setLabelParams(params, [{ key: 'site', value: 'edge' }], [`${DEVICE_FEATURE_LABEL_OS_MODE}=image`]);
    expect(params.get('labelSelector')).toBe(`site=edge,${DEVICE_FEATURE_LABEL_OS_MODE}=image`);
  });

  it('When only feature selectors are set it should still set labelSelector', () => {
    const params = new URLSearchParams();
    setLabelParams(params, undefined, [`${DEVICE_FEATURE_LABEL_GPU_PRESENT}=true`]);
    expect(params.get('labelSelector')).toBe(`${DEVICE_FEATURE_LABEL_GPU_PRESENT}=true`);
  });
});

describe('commonQueries.getFullyCompatibleDeviceCount', () => {
  it('When fleet and feature requirements are set it should query by owner and labelSelector', () => {
    const endpoint = commonQueries.getFullyCompatibleDeviceCount(
      'my-fleet',
      withFeatures({
        [FilterSearchParams.GpuPresent]: [DeviceFeatureBoolean.DeviceFeatureBooleanTrue],
        [FilterSearchParams.OsMode]: [DeviceFeatureBoolean.DeviceFeatureBooleanTrue],
      }),
    );
    const params = new URLSearchParams(endpoint.split('?')[1]);
    expect(endpoint.startsWith('devices?')).toBe(true);
    expect(params.get('limit')).toBe('1');
    expect(params.get('fieldSelector')).toBe('metadata.owner=Fleet/my-fleet');
    expect(params.get('labelSelector')).toBe(
      `${DEVICE_FEATURE_LABEL_GPU_PRESENT}=true,${DEVICE_FEATURE_LABEL_OS_MODE}=image`,
    );
  });
});
