/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Condition } from './Condition';
/**
 * ResourceSyncStatus represents information about the status of a resourcesync
 */
export type ResourceSyncStatus = {
  /**
   * The last commit hash that was synced
   *
   */
  lastSyncedCommitHash?: string;
  /**
   * The last repository path that was synced
   *
   */
  lastSyncedPath?: string;
  /**
   * Current state of a resourcesync.
   */
  conditions?: Array<Condition>;
};

