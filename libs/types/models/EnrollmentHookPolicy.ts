/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApiVersion } from './ApiVersion';
import type { EnrollmentHookPolicySpec } from './EnrollmentHookPolicySpec';
import type { EnrollmentHookPolicyStatus } from './EnrollmentHookPolicyStatus';
import type { ObjectMeta } from './ObjectMeta';
/**
 * EnrollmentHookPolicy defines an org-scoped enrollment hook policy.
 */
export type EnrollmentHookPolicy = {
  apiVersion: ApiVersion;
  /**
   * Kind is a string value representing the REST resource this object represents.
   */
  kind: string;
  metadata: ObjectMeta;
  spec: EnrollmentHookPolicySpec;
  status?: EnrollmentHookPolicyStatus;
};

