/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ConditionStatus } from './ConditionStatus';
import type { RepositoryConditionType } from './RepositoryConditionType';
/**
 * RepositoryCondition contains condition information for a repository.
 */
export type RepositoryCondition = {
  lastHeartbeatTime?: string;
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
   * Type of repository condition.
   */
  type: RepositoryConditionType;
};

