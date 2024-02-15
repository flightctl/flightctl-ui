/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ConditionStatus } from './ConditionStatus';
/**
 * ResourceSyncCondition contains condition information for a resource sync.
 */
export type ResourceSyncCondition = {
  lastTransitionTime?: string;
  /**
   * Human readable message indicating details about last transition.
   */
  message?: string;
  /**
   * (brief) reason for the condition's last transition.
   */
  reason?: string;
  /**
   * Status of the condition, one of True, False, Unknown.
   */
  status: ConditionStatus;
  /**
   * Type of resourcesync condition.
   */
  type: string;
};

