/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { EnrollmentApprovalPolicyPatchOp } from './EnrollmentApprovalPolicyPatchOp';
/**
 * Policy patch operations, including null values for optional limits.
 */
export type EnrollmentApprovalPolicyPatchRequest = Array<{
  /**
   * A JSON Pointer path.
   */
  path: string;
  /**
   * The value to add, replace, or test. A remove operation may omit the value.
   */
  value?: any;
  op: EnrollmentApprovalPolicyPatchOp;
}>;
