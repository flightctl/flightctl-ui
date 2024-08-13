/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DeviceHookSpec } from './DeviceHookSpec';
export type DeviceHooksSpec = {
  /**
   * Hooks executed before updating allow for custom actions and integration with other systems
   * or services. These actions occur before configuration changes are applied to the device.
   *
   */
  beforeUpdating?: Array<DeviceHookSpec>;
  /**
   * Hooks executed after updating enable custom actions and integration with other systems
   * or services. These actions occur after configuration changes have been applied to the device.
   *
   */
  afterUpdating?: Array<DeviceHookSpec>;
  /**
   * Hooks executed before rebooting allow for custom actions and integration with other systems
   * or services. These actions occur before the device is rebooted.
   *
   */
  beforeRebooting?: Array<DeviceHookSpec>;
  /**
   * Hooks executed after rebooting enable custom actions and integration with other systems
   * or services. These actions occur after the device has rebooted, allowing for post-reboot tasks.
   *
   */
  afterRebooting?: Array<DeviceHookSpec>;
};

