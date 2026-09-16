/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Pair counts (completed/total) for a prepare in flight. Per-pair phase is one DeltaGenerationProgress event per step, not a percent heartbeat. Condition messages carry the same completed/total counts.
 */
export type DeltaGenerationStatus = {
  /**
   * Number of joined generation pairs that are already terminal.
   */
  completed: number;
  /**
   * Number of unique generation pairs in this prepare.
   */
  total: number;
  /**
   * Time of the last completed/total write for this prepare.
   */
  lastUpdated?: string;
};

