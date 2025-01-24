/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { EnrollmentRequestApproval } from './EnrollmentRequestApproval';
/**
 * EnrollmentRequestApprovalStatus represents information about the status of a device enrollment request approval.
 */
export type EnrollmentRequestApprovalStatus = (EnrollmentRequestApproval & {
  /**
   * The name of the approver.
   */
  approvedBy: string;
  /**
   * The time at which the request was approved.
   */
  approvedAt: string;
});

