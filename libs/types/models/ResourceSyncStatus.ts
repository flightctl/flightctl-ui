/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Condition } from './Condition';
/**
 * ResourceSyncStatus represents information about the status of a ResourceSync.
 */
export type ResourceSyncStatus = {
  /**
   * The last commit hash that was synced.
   */
  observedCommit?: string;
  /**
   * The last generation that was synced.
   */
  observedGeneration?: number;
  /**
   * Current state of a resourcesync.
   */
  conditions: Array<Condition>;
};

