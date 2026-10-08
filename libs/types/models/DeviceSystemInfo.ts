/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CustomDeviceInfo } from './CustomDeviceInfo';
import type { DeviceGpu } from './DeviceGpu';
import type { DeviceKvm } from './DeviceKvm';
import type { OsModeType } from './OsModeType';
/**
 * System information collected from the device.
 */
export type DeviceSystemInfo = {
  /**
   * The Architecture reported by the device.
   */
  architecture: string;
  /**
   * Boot ID reported by the device.
   */
  bootID: string;
  /**
   * The Operating System reported by the device.
   */
  operatingSystem: string;
  /**
   * The Agent version.
   */
  agentVersion: string;
  /**
   * Version reported by `bootc --version`. Absent when bootc is not installed or the version command fails.
   */
  bootcVersion?: string;
  /**
   * Version reported by `oci-delta --version`, or from Go module build information when that flag is unsupported. Absent when oci-delta is not installed or its version cannot be determined.
   */
  ociDeltaVersion?: string;
  /**
   * Whether this device can consume OCI deltas. True when the oci-delta binary is present. False when it is not. Omitted when an older agent does not report the field.
   */
  deltaEligible?: boolean;
  customInfo?: CustomDeviceInfo;
  /**
   * List of GPU devices discovered on the device.
   */
  gpus?: Array<DeviceGpu>;
  kvm?: DeviceKvm;
  osMode?: OsModeType;
} & {
  /**
   * Corrected by fix-device-system-info.js:
   * Keep named properties with their defined schema types, and define additional properties as strings.
   */
  [key: string]: string | undefined;
};
