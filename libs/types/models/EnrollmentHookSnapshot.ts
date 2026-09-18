/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { EnrollmentHookSnapshotAction } from './EnrollmentHookSnapshotAction';
import type { FailurePolicyType } from './FailurePolicyType';
/**
 * Immutable non-secret copy of EnrollmentHookPolicy fields captured at approval time.
 */
export type EnrollmentHookSnapshot = {
  failurePolicy: FailurePolicyType;
  /**
   * Non-secret copies of control-plane actions from the policy at approval time.
   */
  controlPlaneActions?: Array<EnrollmentHookSnapshotAction>;
};

