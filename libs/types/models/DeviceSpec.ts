/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApplicationProviderSpec } from './ApplicationProviderSpec';
import type { ConfigProviderSpec } from './ConfigProviderSpec';
import type { DeviceConsole } from './DeviceConsole';
import type { DeviceDecommission } from './DeviceDecommission';
import type { DeviceOsSpec } from './DeviceOsSpec';
import type { DeviceUpdatePolicySpec } from './DeviceUpdatePolicySpec';
import type { ResourceMonitor } from './ResourceMonitor';
/**
 * DeviceSpec describes a device.
 */
export type DeviceSpec = {
  updatePolicy?: DeviceUpdatePolicySpec;
  os?: DeviceOsSpec;
  /**
   * List of config providers.
   */
  config?: Array<ConfigProviderSpec>;
  /**
   * List of application providers.
   */
  applications?: Array<ApplicationProviderSpec>;
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
  /**
   * The list of active console sessions.
   */
  consoles?: Array<DeviceConsole>;
  decommissioning?: DeviceDecommission;
};

