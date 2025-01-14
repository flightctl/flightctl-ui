/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Condition } from './Condition';
import type { EnrollmentRequestApprovalStatus } from './EnrollmentRequestApprovalStatus';
/**
 * EnrollmentRequestStatus represents information about the status of a EnrollmentRequest.
 */
export type EnrollmentRequestStatus = {
  /**
   * The PEM-encoded signed certificate.
   */
  certificate?: string;
  /**
   * Current state of the EnrollmentRequest.
   */
  conditions: Array<Condition>;
  approval?: EnrollmentRequestApprovalStatus;
};

