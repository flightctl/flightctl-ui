/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApplicationSpec } from './ApplicationSpec';
import type { ConfigProviderSpec } from './ConfigProviderSpec';
import type { DeviceHooksSpec } from './DeviceHooksSpec';
import type { DeviceOSSpec } from './DeviceOSSpec';
import type { ResourceMonitor } from './ResourceMonitor';
export type DeviceSpec = {
  os?: DeviceOSSpec;
  /**
   * List of config providers.
   */
  config?: Array<ConfigProviderSpec>;
  hooks?: DeviceHooksSpec;
  /**
   * List of applications.
   */
  applications?: Array<ApplicationSpec>;
  containers?: {
    matchPatterns?: Array<string>;
  };
  systemd?: {
    matchPatterns?: Array<string>;
  };
  /**
   * Array of resource monitor configurations.
   */
  resources?: Array<ResourceMonitor>;
};

