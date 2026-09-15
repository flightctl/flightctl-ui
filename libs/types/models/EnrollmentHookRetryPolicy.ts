/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Retry policy for an enrollment hook action.
 */
export type EnrollmentHookRetryPolicy = {
  /**
   * Maximum number of retry attempts. Defaults to 5, max 20.
   */
  maxAttempts?: number;
  /**
   * Backoff strategy (e.g. "exponential"). Defaults to "exponential".
   */
  backoffPolicy?: string;
  /**
   * Initial backoff delay duration (e.g. "2s"). Defaults to "2s".
   */
  backoffDelay?: string;
  /**
   * Maximum backoff duration (e.g. "2m"). Defaults to "2m".
   */
  maxBackoff?: string;
  /**
   * Overall deadline for all retry attempts (e.g. "10m"). Defaults to "10m".
   */
  deadline?: string;
};

