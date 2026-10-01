/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SystemInfoSourceStatus } from './SystemInfoSourceStatus';
/**
 * Collection statuses for built-in and custom information sources.
 */
export type DeviceSystemInfoStatuses = {
  /**
   * Per-source collection status for built-in system information.
   */
  systemInfo: Record<string, SystemInfoSourceStatus>;
  /**
   * Per-source collection status for custom device information.
   */
  customInfo: Record<string, SystemInfoSourceStatus>;
};

