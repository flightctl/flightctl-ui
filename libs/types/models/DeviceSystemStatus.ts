/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DeviceIntegrityStatus } from './DeviceIntegrityStatus';
import type { DeviceResourceStatus } from './DeviceResourceStatus';
import type { DeviceSystemSummaryStatus } from './DeviceSystemSummaryStatus';
export type DeviceSystemStatus = {
  /**
   * The Architecture reported by the device.
   */
  architecture: string;
  /**
   * Boot ID reported by the device.
   */
  bootID: string;
  /**
   * MachineID reported by the device.
   */
  machineID: string;
  /**
   * The Operating System reported by the device.
   */
  operatingSystem: string;
  /**
   * The integrity measurements of the system.
   */
  measurements: Record<string, string>;
  /**
   * Current status of the resources of the device.
   */
  resources: DeviceResourceStatus;
  /**
   * Current status of the integrity of the device.
   */
  integrity: DeviceIntegrityStatus;
  /**
   * Status summary type of the device system summary.
   */
  summary?: DeviceSystemSummaryStatus;
};

