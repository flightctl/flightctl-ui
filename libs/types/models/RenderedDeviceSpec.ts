/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CPUResourceMonitorSpec } from './CPUResourceMonitorSpec';
import type { CustomResourceMonitorSpec } from './CustomResourceMonitorSpec';
import type { DeviceOSSpec } from './DeviceOSSpec';
import type { DiskResourceMonitorSpec } from './DiskResourceMonitorSpec';
import type { MemoryResourceMonitorSpec } from './MemoryResourceMonitorSpec';
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
  resources: Array<(CPUResourceMonitorSpec | MemoryResourceMonitorSpec | DiskResourceMonitorSpec | CustomResourceMonitorSpec)>;
};

