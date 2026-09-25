/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CustomDeviceInfo } from './CustomDeviceInfo';
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
   * Version reported by `oci-delta --version`. Absent when oci-delta is not installed or the version command fails.
   */
  ociDeltaVersion?: string;
  /**
   * Whether this device can consume OCI deltas. True when the oci-delta binary is present. False when it is not. Omitted when an older agent does not report the field.
   */
  deltaEligible?: boolean;
  customInfo?: CustomDeviceInfo;
} & {
  /**
   * Corrected by fix-device-system-info.js:
   * Keep named properties with their defined schema types, and define additional properties as strings.
   */
  [key: string]: string | undefined;
};
