/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Condition } from './Condition';
import type { DeviceApplicationsStatus } from './DeviceApplicationsStatus';
import type { DeviceConfigStatus } from './DeviceConfigStatus';
import type { DeviceIntegrityStatus } from './DeviceIntegrityStatus';
import type { DeviceOSStatus } from './DeviceOSStatus';
import type { DeviceResourceStatus } from './DeviceResourceStatus';
import type { DeviceSummaryStatus } from './DeviceSummaryStatus';
import type { DeviceSystemInfo } from './DeviceSystemInfo';
import type { DeviceUpdatedStatus } from './DeviceUpdatedStatus';
/**
 * DeviceStatus represents information about the status of a device. Status may trail the actual state of a device.
 */
export type DeviceStatus = {
  /**
   * Conditions represent the observations of a the current state of a device.
   */
  conditions: Record<string, Condition>;
  systemInfo: DeviceSystemInfo;
  /**
   * Current status of the system applications.
   */
  applications: DeviceApplicationsStatus;
  /**
   * Current status of the resources of the device.
   */
  resources: DeviceResourceStatus;
  /**
   * Current status of the integrity of the device.
   */
  integrity: DeviceIntegrityStatus;
  /**
   * Current status of the device config.
   */
  config: DeviceConfigStatus;
  /**
   * Current status of the device OS.
   */
  os: DeviceOSStatus;
  /**
   * Current status of the device update.
   */
  updated: DeviceUpdatedStatus;
  /**
   * Summary status of the device.
   */
  summary: DeviceSummaryStatus;
  updatedAt: string;
};

