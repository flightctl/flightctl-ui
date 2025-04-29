/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ResourceMonitorSpec } from './ResourceMonitorSpec';
export type DiskResourceMonitorSpec = (ResourceMonitorSpec & {
  /**
   * The type of resource to monitor.
   */
  monitorType: string;
} & {
  /**
   * The directory path to monitor for disk usage.
   */
  path: string;
});

