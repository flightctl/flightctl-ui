import { describe, expect, it } from 'vitest';
import { DeviceFeatureBoolean } from '@flightctl/types/alpha';
import { OsModeType } from '@flightctl/types';

import {
  DEVICE_FEATURE_GPU_PRESENT,
  DEVICE_FEATURE_KVM_ENABLED,
  DEVICE_FEATURE_LABEL_KVM_ENABLED,
  DEVICE_FEATURE_OS_MODE,
  deviceFeaturesFromApi,
  deviceFeaturesToApi,
  deviceFeaturesToFilters,
  getEmptyDeviceFeaturesFormValues,
  mergeDeviceFeatureFilters,
  mergeDeviceFeatures,
} from './catalogDeviceFeatures';
import {
  buildDeviceFeatureLabelSelectors,
  buildIncompatibleFleetDevicesQueries,
  invertDeviceFeatureRequirementFilter,
} from './query';
import { FilterSearchParams, OS_EXCLUDE_PACKAGE_MODE_FILTERS, UNKNOWN_CAPABILITY_VALUE } from './status/devices';

describe('catalogDeviceFeatures', () => {
  it.each([
    {
      name: 'When deviceFeatures is absent it should return null',
      features: undefined,
      expected: null,
    },
    {
      name: 'When deviceFeatures is empty it should return null',
      features: {},
      expected: null,
    },
    {
      name: 'When known include and exclude values are set it should map them to form fields',
      features: {
        [DEVICE_FEATURE_GPU_PRESENT]: DeviceFeatureBoolean.DeviceFeatureBooleanTrue,
        [DEVICE_FEATURE_KVM_ENABLED]: DeviceFeatureBoolean.DeviceFeatureBooleanFalse,
        [DEVICE_FEATURE_OS_MODE]: OsModeType.OsModeImage,
      },
      expected: {
        gpuPresent: DeviceFeatureBoolean.DeviceFeatureBooleanTrue,
        kvmEnabled: DeviceFeatureBoolean.DeviceFeatureBooleanFalse,
        osMode: OsModeType.OsModeImage,
      },
    },
    {
      name: 'When boolean true or false is set it should map them to feature enums',
      features: {
        [DEVICE_FEATURE_GPU_PRESENT]: true,
        [DEVICE_FEATURE_KVM_ENABLED]: false,
      },
      expected: {
        gpuPresent: DeviceFeatureBoolean.DeviceFeatureBooleanTrue,
        kvmEnabled: DeviceFeatureBoolean.DeviceFeatureBooleanFalse,
        osMode: '',
      },
    },
    {
      name: 'When unknown keys are present it should ignore them',
      features: {
        [DEVICE_FEATURE_GPU_PRESENT]: DeviceFeatureBoolean.DeviceFeatureBooleanTrue,
        'custom.feature': 'enabled',
      },
      expected: {
        gpuPresent: DeviceFeatureBoolean.DeviceFeatureBooleanTrue,
        kvmEnabled: '',
        osMode: '',
      },
    },
    {
      name: 'When a known key has an invalid value it should treat it as unspecified',
      features: {
        [DEVICE_FEATURE_GPU_PRESENT]: 'maybe',
      },
      expected: null,
    },
  ])('$name', ({ features, expected }) => {
    expect(deviceFeaturesFromApi(features)).toEqual(expected);
  });

  it('When all known features are unspecified it should omit deviceFeatures from the API payload', () => {
    expect(deviceFeaturesToApi(getEmptyDeviceFeaturesFormValues())).toBeUndefined();
    expect(deviceFeaturesToApi(null)).toBeUndefined();
  });

  it('When known features are set it should emit dotted API keys', () => {
    expect(
      deviceFeaturesToApi({
        gpuPresent: DeviceFeatureBoolean.DeviceFeatureBooleanTrue,
        kvmEnabled: DeviceFeatureBoolean.DeviceFeatureBooleanFalse,
        osMode: OsModeType.OsModePackage,
      }),
    ).toEqual({
      [DEVICE_FEATURE_GPU_PRESENT]: DeviceFeatureBoolean.DeviceFeatureBooleanTrue,
      [DEVICE_FEATURE_KVM_ENABLED]: DeviceFeatureBoolean.DeviceFeatureBooleanFalse,
      [DEVICE_FEATURE_OS_MODE]: OsModeType.OsModePackage,
    });
  });

  it('When converting to API and back it should keep unknown fields', () => {
    const original = {
      [DEVICE_FEATURE_KVM_ENABLED]: DeviceFeatureBoolean.DeviceFeatureBooleanFalse,
      'vendor.extra': DeviceFeatureBoolean.DeviceFeatureBooleanFalse,
    };
    expect(deviceFeaturesToApi(deviceFeaturesFromApi(original), original)).toEqual({
      [DEVICE_FEATURE_KVM_ENABLED]: DeviceFeatureBoolean.DeviceFeatureBooleanFalse,
      'vendor.extra': DeviceFeatureBoolean.DeviceFeatureBooleanFalse,
    });
  });

  it('When only unknown keys exist it should preserve them on save', () => {
    const original = { 'vendor.extra': DeviceFeatureBoolean.DeviceFeatureBooleanFalse };
    expect(deviceFeaturesToApi(deviceFeaturesFromApi(original), original)).toEqual({
      'vendor.extra': DeviceFeatureBoolean.DeviceFeatureBooleanFalse,
    });
  });

  it.each([
    {
      name: 'When deviceFeatures is absent it should return null',
      features: undefined,
      expected: null,
    },
    {
      name: 'When deviceFeatures is empty it should return null',
      features: {},
      expected: null,
    },
    {
      name: 'When known features are set it should return sparse filters with os.mode as boolean',
      features: {
        [DEVICE_FEATURE_GPU_PRESENT]: DeviceFeatureBoolean.DeviceFeatureBooleanTrue,
        [DEVICE_FEATURE_KVM_ENABLED]: DeviceFeatureBoolean.DeviceFeatureBooleanFalse,
        [DEVICE_FEATURE_OS_MODE]: OsModeType.OsModeImage,
      },
      expected: [
        { fieldId: 'gpuPresent', values: [DeviceFeatureBoolean.DeviceFeatureBooleanTrue] },
        { fieldId: 'kvmEnabled', values: [DeviceFeatureBoolean.DeviceFeatureBooleanFalse] },
        { fieldId: 'osMode', values: [DeviceFeatureBoolean.DeviceFeatureBooleanTrue] },
      ],
    },
    {
      name: 'When os.mode is package it should map to filter false',
      features: {
        [DEVICE_FEATURE_OS_MODE]: OsModeType.OsModePackage,
      },
      expected: [{ fieldId: 'osMode', values: [DeviceFeatureBoolean.DeviceFeatureBooleanFalse] }],
    },
  ])('$name', ({ features, expected }) => {
    expect(deviceFeaturesToFilters(features)).toEqual(expected);
  });

  it('When merging OS exclude with requirements it should let requirements override osMode', () => {
    expect(
      mergeDeviceFeatureFilters(OS_EXCLUDE_PACKAGE_MODE_FILTERS, [
        { fieldId: 'osMode', values: [DeviceFeatureBoolean.DeviceFeatureBooleanTrue] },
        { fieldId: 'gpuPresent', values: [DeviceFeatureBoolean.DeviceFeatureBooleanTrue] },
      ]),
    ).toEqual([
      { fieldId: 'osMode', values: [DeviceFeatureBoolean.DeviceFeatureBooleanTrue] },
      { fieldId: 'gpuPresent', values: [DeviceFeatureBoolean.DeviceFeatureBooleanTrue] },
    ]);
  });

  it('When OS exclude package filters are used they should keep image and unknown', () => {
    expect(OS_EXCLUDE_PACKAGE_MODE_FILTERS).toEqual([
      {
        fieldId: 'osMode',
        values: [DeviceFeatureBoolean.DeviceFeatureBooleanTrue, UNKNOWN_CAPABILITY_VALUE],
      },
    ]);
  });

  it.each([
    {
      name: 'When all inputs are empty it should return undefined',
      featuresList: [undefined, null, {}],
      expected: undefined,
    },
    {
      name: 'When features come from multiple catalog items it should union keys',
      featuresList: [
        { [DEVICE_FEATURE_GPU_PRESENT]: DeviceFeatureBoolean.DeviceFeatureBooleanTrue },
        { [DEVICE_FEATURE_KVM_ENABLED]: DeviceFeatureBoolean.DeviceFeatureBooleanTrue },
      ],
      expected: {
        [DEVICE_FEATURE_GPU_PRESENT]: DeviceFeatureBoolean.DeviceFeatureBooleanTrue,
        [DEVICE_FEATURE_KVM_ENABLED]: DeviceFeatureBoolean.DeviceFeatureBooleanTrue,
      },
    },
    {
      name: 'When the same key appears with the same value it should keep that value',
      featuresList: [
        { [DEVICE_FEATURE_GPU_PRESENT]: DeviceFeatureBoolean.DeviceFeatureBooleanTrue },
        { [DEVICE_FEATURE_GPU_PRESENT]: DeviceFeatureBoolean.DeviceFeatureBooleanTrue },
      ],
      expected: {
        [DEVICE_FEATURE_GPU_PRESENT]: DeviceFeatureBoolean.DeviceFeatureBooleanTrue,
      },
    },
  ])('$name', ({ featuresList, expected }) => {
    expect(mergeDeviceFeatures(...featuresList)).toEqual(expected);
  });

  it('When the same key appears with different values it should throw', () => {
    expect(() =>
      mergeDeviceFeatures(
        { [DEVICE_FEATURE_GPU_PRESENT]: DeviceFeatureBoolean.DeviceFeatureBooleanTrue },
        { [DEVICE_FEATURE_GPU_PRESENT]: DeviceFeatureBoolean.DeviceFeatureBooleanFalse },
      ),
    ).toThrow();
  });

  it('When inverting a present requirement it should select false and unknown', () => {
    const inverted = invertDeviceFeatureRequirementFilter({
      fieldId: 'kvmEnabled',
      values: [DeviceFeatureBoolean.DeviceFeatureBooleanTrue],
    });
    expect(inverted).toEqual({
      fieldId: 'kvmEnabled',
      values: [DeviceFeatureBoolean.DeviceFeatureBooleanFalse, UNKNOWN_CAPABILITY_VALUE],
    });
    // Compiles to label!=true (matches reported false and absent), not !label.
    expect(buildDeviceFeatureLabelSelectors(inverted ? [inverted] : [])).toEqual([
      `${DEVICE_FEATURE_LABEL_KVM_ENABLED}!=true`,
    ]);
  });

  it('When a single KVM requirement is set it should return one incompatible fleet query', () => {
    const links = buildIncompatibleFleetDevicesQueries('fdas', {
      [DEVICE_FEATURE_KVM_ENABLED]: DeviceFeatureBoolean.DeviceFeatureBooleanTrue,
    });
    expect(links).toHaveLength(1);
    expect(links[0].fieldId).toBe('kvmEnabled');
    expect(links[0].mustBePresent).toBe(true);
    expect(links[0].incompatibleFilters).toEqual({
      fieldId: 'kvmEnabled',
      values: [DeviceFeatureBoolean.DeviceFeatureBooleanFalse, UNKNOWN_CAPABILITY_VALUE],
    });
    const params = new URLSearchParams(links[0].incompatibleQuery);
    expect(params.getAll(FilterSearchParams.Fleet)).toEqual(['fdas']);
    expect(params.getAll(FilterSearchParams.KvmEnabled).sort()).toEqual(
      [DeviceFeatureBoolean.DeviceFeatureBooleanFalse, UNKNOWN_CAPABILITY_VALUE].sort(),
    );
  });

  it('When multiple requirements are set it should return one incompatible query per feature', () => {
    const links = buildIncompatibleFleetDevicesQueries('fdas', {
      [DEVICE_FEATURE_GPU_PRESENT]: DeviceFeatureBoolean.DeviceFeatureBooleanTrue,
      [DEVICE_FEATURE_KVM_ENABLED]: DeviceFeatureBoolean.DeviceFeatureBooleanTrue,
    });
    expect(links.map((link) => link.fieldId).sort()).toEqual(['gpuPresent', 'kvmEnabled']);

    const gpuLink = links.find((link) => link.fieldId === 'gpuPresent');
    const gpuParams = new URLSearchParams(gpuLink?.incompatibleQuery);
    expect(gpuParams.getAll(FilterSearchParams.Fleet)).toEqual(['fdas']);
    expect(gpuParams.getAll(FilterSearchParams.GpuPresent).sort()).toEqual(
      [DeviceFeatureBoolean.DeviceFeatureBooleanFalse, UNKNOWN_CAPABILITY_VALUE].sort(),
    );
    expect(gpuParams.getAll(FilterSearchParams.KvmEnabled)).toEqual([]);
    expect(gpuLink?.incompatibleFilters.fieldId).toBe('gpuPresent');

    const kvmLink = links.find((link) => link.fieldId === 'kvmEnabled');
    const kvmParams = new URLSearchParams(kvmLink?.incompatibleQuery);
    expect(kvmParams.getAll(FilterSearchParams.Fleet)).toEqual(['fdas']);
    expect(kvmParams.getAll(FilterSearchParams.KvmEnabled).sort()).toEqual(
      [DeviceFeatureBoolean.DeviceFeatureBooleanFalse, UNKNOWN_CAPABILITY_VALUE].sort(),
    );
    expect(kvmParams.getAll(FilterSearchParams.GpuPresent)).toEqual([]);
    expect(kvmLink?.incompatibleFilters.fieldId).toBe('kvmEnabled');
  });
});
