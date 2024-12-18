/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DeviceConsole } from './DeviceConsole';
import type { DeviceDecommission } from './DeviceDecommission';
import type { DeviceOSSpec } from './DeviceOSSpec';
import type { DeviceUpdatePolicySpec } from './DeviceUpdatePolicySpec';
import type { RenderedApplicationSpec } from './RenderedApplicationSpec';
import type { ResourceMonitor } from './ResourceMonitor';
/**
 * RenderedDeviceSpec describes the rendered and self-contained specification of a Device.
 */
export type RenderedDeviceSpec = {
  /**
   * Version of the rendered device spec.
   */
  renderedVersion: string;
  updatePolicy?: DeviceUpdatePolicySpec;
  os?: DeviceOSSpec;
  /**
   * The configuration to apply, in Ignition format.
   */
  config?: string;
  /**
   * The list of applications to deploy.
   */
  applications?: Array<RenderedApplicationSpec>;
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
  console?: DeviceConsole;
  decommission?: DeviceDecommission;
};

