/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Condition } from './Condition';
import type { ContainerStatus } from './ContainerStatus';
import type { DeviceConfigStatus } from './DeviceConfigStatus';
import type { DeviceSystemdUnitStatus } from './DeviceSystemdUnitStatus';
import type { DeviceSystemInfo } from './DeviceSystemInfo';
import type { DeviceSystemStatus } from './DeviceSystemStatus';
import type { DeviceUpdateStatus } from './DeviceUpdateStatus';
import type { DeviceWorkloadStatus } from './DeviceWorkloadStatus';
/**
 * DeviceStatus represents information about the status of a device. Status may trail the actual state of a device, especially if the device has not contacted the management service in a while.
 */
export type DeviceStatus = {
  updatedAt?: string;
  /**
   * Current state of the device.
   */
  conditions?: Array<Condition>;
  systemInfo?: DeviceSystemInfo;
  /**
   * Statuses of containers in the device.
   */
  containers?: Array<ContainerStatus>;
  /**
   * Current state of systemd units on the device.
   */
  systemdUnits?: Array<DeviceSystemdUnitStatus>;
  /**
   * Current status of the device workload.
   */
  workload?: DeviceWorkloadStatus;
  /**
   * Current status of the device system.
   */
  system?: DeviceSystemStatus;
  /**
   * Current device update status.
   */
  update?: DeviceUpdateStatus;
  /**
   * Current device config status.
   */
  config?: DeviceConfigStatus;
};

