/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Condition } from './Condition';
import type { DeviceApplicationsSummaryStatus } from './DeviceApplicationsSummaryStatus';
import type { DeviceApplicationStatus } from './DeviceApplicationStatus';
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
  conditions: Array<Condition>;
  systemInfo: DeviceSystemInfo;
  /**
   * List of device application status.
   */
  applications: Array<DeviceApplicationStatus>;
  /**
   * Summary status of the device applications.
   */
  applicationsSummary: DeviceApplicationsSummaryStatus;
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
  lastSeen: string;
};

