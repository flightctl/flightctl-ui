/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DependencySyncConfigRefStatus } from './DependencySyncConfigRefStatus';
/**
 * DependencySyncStatus represents the synchronization fingerprints for external dependencies of a device, captured at render time.
 */
export type DependencySyncStatus = {
  /**
   * Per-config-provider fingerprint and last update time, set when the device renders.
   */
  configRefs?: Array<DependencySyncConfigRefStatus>;
};

