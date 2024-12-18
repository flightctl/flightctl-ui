/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApplicationSpec } from './ApplicationSpec';
import type { ConfigProviderSpec } from './ConfigProviderSpec';
import type { DeviceOSSpec } from './DeviceOSSpec';
import type { DeviceUpdatePolicySpec } from './DeviceUpdatePolicySpec';
import type { ResourceMonitor } from './ResourceMonitor';
/**
 * DeviceSpec describes a device.
 */
export type DeviceSpec = {
  updatePolicy?: DeviceUpdatePolicySpec;
  os?: DeviceOSSpec;
  /**
   * List of config providers.
   */
  config?: Array<ConfigProviderSpec>;
  /**
   * List of applications.
   */
  applications?: Array<ApplicationSpec>;
  /**
   * The systemd services to monitor.
   */
  systemd?: {
    /**
     * A list of match patterns.
     */
    matchPatterns?: Array<string>;
  };
  /**
   * Array of resource monitor configurations.
   */
  resources?: Array<ResourceMonitor>;
};

