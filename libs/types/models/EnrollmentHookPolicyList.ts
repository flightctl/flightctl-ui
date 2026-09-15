/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApiVersion } from './ApiVersion';
import type { EnrollmentHookPolicy } from './EnrollmentHookPolicy';
import type { ListMeta } from './ListMeta';
/**
 * EnrollmentHookPolicyList is a list of EnrollmentHookPolicy resources.
 */
export type EnrollmentHookPolicyList = {
  apiVersion: ApiVersion;
  /**
   * Kind is a string value representing the REST resource this object represents.
   */
  kind: string;
  metadata: ListMeta;
  /**
   * List of enrollment hook policies.
   */
  items: Array<EnrollmentHookPolicy>;
};

