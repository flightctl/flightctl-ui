/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { EnrollmentHookHttpAction } from './EnrollmentHookHttpAction';
import type { FailurePolicyType } from './FailurePolicyType';
/**
 * Configuration for a stage of enrollment hooks.
 */
export type EnrollmentHookStageSpec = {
  failurePolicy?: FailurePolicyType;
  /**
   * List of HTTP actions to execute during this enrollment stage.
   */
  controlPlaneActions?: Array<EnrollmentHookHttpAction>;
};

