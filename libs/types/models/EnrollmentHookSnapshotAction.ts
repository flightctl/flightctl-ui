/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { EnrollmentHookRetryPolicy } from './EnrollmentHookRetryPolicy';
/**
 * Non-secret copy of an enrollment hook HTTP action. Excludes auth/bearerToken.
 */
export type EnrollmentHookSnapshotAction = {
  /**
   * Original action index in the policy.
   */
  index: number;
  /**
   * The HTTPS URL to call.
   */
  url: string;
  /**
   * Timeout duration (e.g. "30s").
   */
  timeout?: string;
  retry?: EnrollmentHookRetryPolicy;
};

