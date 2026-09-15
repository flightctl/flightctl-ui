/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { EnrollmentHookAuth } from './EnrollmentHookAuth';
import type { EnrollmentHookRetryPolicy } from './EnrollmentHookRetryPolicy';
/**
 * An HTTP action to execute as part of an enrollment hook.
 */
export type EnrollmentHookHttpAction = {
  /**
   * The HTTPS URL to call.
   */
  url: string;
  /**
   * Timeout duration (e.g. "30s"). Defaults to 30s, max 5m.
   */
  timeout?: string;
  retry?: EnrollmentHookRetryPolicy;
  auth?: EnrollmentHookAuth;
};

