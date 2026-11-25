/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApiVersion } from './ApiVersion';
import type { EnrollmentApprovalPolicySpec } from './EnrollmentApprovalPolicySpec';
import type { EnrollmentApprovalPolicyStatus } from './EnrollmentApprovalPolicyStatus';
import type { ObjectMeta } from './ObjectMeta';
/**
 * Tenant-scoped enrollment approval policy.
 */
export type EnrollmentApprovalPolicy = {
  apiVersion: ApiVersion;
  /**
   * REST resource kind.
   */
  kind: string;
  metadata: ObjectMeta;
  spec: EnrollmentApprovalPolicySpec;
  status?: EnrollmentApprovalPolicyStatus;
};

