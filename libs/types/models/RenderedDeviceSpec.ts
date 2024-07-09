/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DeviceOSSpec } from './DeviceOSSpec';
import type { ResourceMonitor } from './ResourceMonitor';
export type RenderedDeviceSpec = {
  renderedVersion: string;
  os?: DeviceOSSpec;
  containers?: {
    matchPatterns?: Array<string>;
  };
  config?: string;
  systemd?: {
    matchPatterns?: Array<string>;
  };
  /**
   * Array of resource monitor configurations.
   */
  resources?: Array<ResourceMonitor>;
};

