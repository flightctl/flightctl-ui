/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DeviceRebootHookSpec } from './DeviceRebootHookSpec';
import type { DeviceUpdateHookSpec } from './DeviceUpdateHookSpec';
export type DeviceHooksSpec = {
  /**
   * Hooks executed before updating allow for custom actions and integration with other systems
   * or services. These actions occur before configuration changes are applied to the device.
   *
   */
  beforeUpdating?: Array<DeviceUpdateHookSpec>;
  /**
   * Hooks executed after updating enable custom actions and integration with other systems
   * or services. These actions occur after configuration changes have been applied to the device.
   *
   */
  afterUpdating?: Array<DeviceUpdateHookSpec>;
  /**
   * Hooks executed before rebooting allow for custom actions and integration with other systems
   * or services. These actions occur before the device is rebooted.
   *
   */
  beforeRebooting?: Array<DeviceRebootHookSpec>;
  /**
   * Hooks executed after rebooting enable custom actions and integration with other systems
   * or services. These actions occur after the device has rebooted, allowing for post-reboot tasks.
   *
   */
  afterRebooting?: Array<DeviceRebootHookSpec>;
};

