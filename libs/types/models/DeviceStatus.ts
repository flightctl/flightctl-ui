/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Condition } from './Condition';
import type { DeviceApplicationsSummaryStatus } from './DeviceApplicationsSummaryStatus';
import type { DeviceApplicationStatus } from './DeviceApplicationStatus';
import type { DeviceConfigStatus } from './DeviceConfigStatus';
import type { DeviceIntegrityStatus } from './DeviceIntegrityStatus';
import type { DeviceLifecycleStatus } from './DeviceLifecycleStatus';
import type { DeviceOsStatus } from './DeviceOsStatus';
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
  applicationsSummary: DeviceApplicationsSummaryStatus;
  resources: DeviceResourceStatus;
  integrity: DeviceIntegrityStatus;
  config: DeviceConfigStatus;
  os: DeviceOsStatus;
  updated: DeviceUpdatedStatus;
  summary: DeviceSummaryStatus;
  /**
   * The last time the device was seen by the service.
   */
  lastSeen: string;
  lifecycle: DeviceLifecycleStatus;
};

