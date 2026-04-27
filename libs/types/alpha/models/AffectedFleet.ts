/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { VulnerabilityGroupItem } from './VulnerabilityGroupItem';
/**
 * One fleet or the fleetless aggregate with device and image counts for a CVE.
 */
export type AffectedFleet = {
  /**
   * Fleet metadata.name, empty for the fleetless aggregate.
   */
  fleetName: string;
  /**
   * True when this row represents devices not owned by a fleet.
   */
  fleetless: boolean;
  /**
   * Devices in this fleet or fleetless group affected by the CVE.
   */
  affectedDevices: number;
  /**
   * Per-digest findings within this fleet or fleetless group.
   */
  findings: Array<VulnerabilityGroupItem>;
};

