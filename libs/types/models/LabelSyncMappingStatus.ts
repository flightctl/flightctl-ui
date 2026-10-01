/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Condition } from './Condition';
/**
 * Current propagation state for a label synchronization mapping.
 */
export type LabelSyncMappingStatus = {
  /**
   * The Ready condition reports Pending, Degraded, or Success state.
   */
  conditions?: Array<Condition>;
};

