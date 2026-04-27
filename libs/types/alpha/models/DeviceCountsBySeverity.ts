/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Counts of distinct devices affected in the organization, grouped by vulnerability severity.
 */
export type DeviceCountsBySeverity = {
  /**
   * Number of distinct devices with at least one vulnerability finding in the organization.
   */
  total: number;
  /**
   * Number of devices whose highest severity finding is critical.
   */
  critical: number;
  /**
   * Number of devices whose highest severity finding is high.
   */
  high: number;
  /**
   * Number of devices whose highest severity finding is medium.
   */
  medium: number;
  /**
   * Number of devices whose highest severity finding is low.
   */
  low: number;
  /**
   * Number of devices whose highest severity finding is none.
   */
  none: number;
  /**
   * Number of devices whose highest severity finding is unknown.
   */
  unknown: number;
};

