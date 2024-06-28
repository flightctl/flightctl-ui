/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ConditionStatus } from './ConditionStatus';
import type { ConditionType } from './ConditionType';
/**
 * Condition contains details for one aspect of the current state of this API Resource.
 */
export type Condition = {
  /**
   * Type of condition in CamelCase
   */
  type: ConditionType;
  /**
   * Status of the condition, one of True, False, Unknown.
   */
  status: ConditionStatus;
  /**
   * The .metadata.generation that the condition was set based upon.
   */
  observedGeneration?: number;
  /**
   * The last time the condition transitioned from one status to another.
   */
  lastTransitionTime: string;
  /**
   * Human readable message indicating details about last transition.
   */
  message: string;
  /**
   * (brief) reason for the condition's last transition.
   */
  reason: string;
};

