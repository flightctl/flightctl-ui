/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ContainerStatus } from './ContainerStatus';
import type { DeviceCondition } from './DeviceCondition';
import type { DeviceSystemdUnitStatus } from './DeviceSystemdUnitStatus';
import type { DeviceSystemInfo } from './DeviceSystemInfo';
/**
 * DeviceStatus represents information about the status of a device. Status may trail the actual state of a device, especially if the device has not contacted the management service in a while.
 */
export type DeviceStatus = {
  updatedAt?: string;
  /**
   * Current state of the device.
   */
  conditions?: Array<DeviceCondition>;
  systemInfo?: DeviceSystemInfo;
  /**
   * Statuses of containers in the device.
   */
  containers?: Array<ContainerStatus>;
  /**
   * Current state of systemd units on the device.
   */
  systemdUnits?: Array<DeviceSystemdUnitStatus>;
};

