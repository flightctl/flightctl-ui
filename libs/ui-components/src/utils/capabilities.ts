import { type Device, type DeviceCapabilities, OsModeType } from '@flightctl/types';

export const getDeviceCapability = (
  capabilities: DeviceCapabilities | undefined,
  capability: keyof DeviceCapabilities,
): DeviceCapabilities[keyof DeviceCapabilities] | undefined => capabilities?.[capability];

export const hasPackageModeCapability = (device: Device): boolean =>
  getDeviceCapability(device?.status?.capabilities, 'osMode') === OsModeType.OsModePackage;
