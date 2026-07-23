import { type Device, type DeviceCapabilities, OsModeType } from '@flightctl/types';

export const getDeviceCapability = (
  device: Device,
  capability: keyof DeviceCapabilities,
): DeviceCapabilities[keyof DeviceCapabilities] | undefined => device.status?.capabilities?.[capability];

export const hasPackageModeCapability = (device: Device): boolean =>
  getDeviceCapability(device, 'osMode') === OsModeType.OsModePackage;
