/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DeviceConsole } from './DeviceConsole';
import type { DeviceHooksSpec } from './DeviceHooksSpec';
import type { DeviceOSSpec } from './DeviceOSSpec';
import type { RenderedApplicationSpec } from './RenderedApplicationSpec';
import type { ResourceMonitor } from './ResourceMonitor';
export type RenderedDeviceSpec = {
  renderedVersion: string;
  os?: DeviceOSSpec;
  containers?: {
    matchPatterns?: Array<string>;
  };
  config?: string;
  applications?: Array<RenderedApplicationSpec>;
  hooks?: DeviceHooksSpec;
  systemd?: {
    matchPatterns?: Array<string>;
  };
  /**
   * Array of resource monitor configurations.
   */
  resources?: Array<ResourceMonitor>;
  console?: DeviceConsole;
};

