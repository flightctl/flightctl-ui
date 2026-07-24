/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Breakdowns of devices by status.capabilities fields.
 */
export type DevicesSummaryCapabilities = {
  /**
   * Counts by status.capabilities.osMode (e.g. image, package). The key "unknown" counts devices that have not reported the capability.
   */
  osMode?: Record<string, number>;
};

