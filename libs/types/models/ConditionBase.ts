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
   * A human-readable message describing the condition, including details or progress. Consumers should not parse this field.
   */
  message: string;
  /**
   * A brief, machine-readable reason for the condition's last transition. Use a stable CamelCase identifier and put human-readable details in message.
   */
  reason: string;
};

