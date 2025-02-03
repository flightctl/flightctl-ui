/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * DisruptionBudget defines the level of allowed disruption when rollout is in progress.
 */
export type DisruptionBudget = {
  /**
   * List of label keys to perform grouping for the disruption budget.
   */
  groupBy?: Array<string>;
  /**
   * The maximum number of unavailable devices allowed during rollout.
   */
  minAvailable?: number;
  /**
   * The minimum number of required available devices during rollout.
   */
  maxUnavailable?: number;
};

