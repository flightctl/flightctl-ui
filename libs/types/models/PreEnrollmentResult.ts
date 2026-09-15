/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { PreEnrollmentActionResult } from './PreEnrollmentActionResult';
/**
 * Result of pre-enrollment hook execution, agent-populated.
 */
export type PreEnrollmentResult = {
  /**
   * Whether all pre-enrollment hooks completed with exit code 0.
   */
  success: boolean;
  /**
   * Per-action results in execution order.
   */
  actions?: Array<PreEnrollmentActionResult>;
};

