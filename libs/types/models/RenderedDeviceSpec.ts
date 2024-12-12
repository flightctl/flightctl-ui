/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DeviceConsole } from './DeviceConsole';
import type { DeviceOSSpec } from './DeviceOSSpec';
import type { DeviceUpdatePolicySpec } from './DeviceUpdatePolicySpec';
import type { RenderedApplicationSpec } from './RenderedApplicationSpec';
import type { ResourceMonitor } from './ResourceMonitor';
export type RenderedDeviceSpec = {
  renderedVersion: string;
  updatePolicy?: DeviceUpdatePolicySpec;
  os?: DeviceOSSpec;
  config?: string;
  applications?: Array<RenderedApplicationSpec>;
  systemd?: {
    matchPatterns?: Array<string>;
  };
  /**
   * Array of resource monitor configurations.
   */
  resources?: Array<ResourceMonitor>;
  console?: DeviceConsole;
};

