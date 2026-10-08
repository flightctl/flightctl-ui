/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Breakdowns of devices by status.systemInfo fields, falling back to the deprecated status.capabilities fields when unavailable.
 */
export type DevicesSummaryCapabilities = {
  /**
   * Counts by device OS mode (e.g. image, package), taken from status.systemInfo.osMode with fallback to the deprecated status.capabilities.osMode. The key "unknown" counts devices that have not reported an OS mode.
   */
  osMode?: Record<string, number>;
};

