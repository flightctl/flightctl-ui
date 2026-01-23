/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ConditionStatus } from './ConditionStatus';
/**
 * Base condition structure following Kubernetes API conventions. Use with allOf to add a specific type enum.
 */
export type ConditionBase = {
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
   * A (brief) reason for the condition's last transition.
   */
  reason: string;
};

