/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Counts of distinct CVEs in the organization by highest severity.
 */
export type CveCountsBySeverity = {
  /**
   * Total distinct CVEs across the organization.
   */
  total: number;
  /**
   * Count of distinct Critical CVEs.
   */
  critical: number;
  /**
   * Count of distinct High CVEs.
   */
  high: number;
  /**
   * Count of distinct Medium CVEs.
   */
  medium: number;
  /**
   * Count of distinct Low CVEs.
   */
  low: number;
  /**
   * Count of distinct CVEs with no exploitable impact (CVSS score 0).
   */
  none: number;
  /**
   * Count of distinct CVEs with unknown or unscored severity.
   */
  unknown: number;
};

