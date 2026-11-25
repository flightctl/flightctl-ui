/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApiVersion } from './ApiVersion';
import type { EnrollmentApprovalPolicy } from './EnrollmentApprovalPolicy';
import type { ListMeta } from './ListMeta';
/**
 * Tenant-scoped collection of enrollment approval policies.
 */
export type EnrollmentApprovalPolicyList = {
  apiVersion: ApiVersion;
  /**
   * REST resource kind.
   */
  kind: string;
  metadata: ListMeta;
  /**
   * Enrollment approval policies in this tenant.
   */
  items: Array<EnrollmentApprovalPolicy>;
};

