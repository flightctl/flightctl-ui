/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { EnrollmentRequestApproval } from './EnrollmentRequestApproval';
import type { EnrollmentRequestCondition } from './EnrollmentRequestCondition';
/**
 * EnrollmentRequestStatus represents information about the status of a EnrollmentRequest.
 */
export type EnrollmentRequestStatus = {
  /**
   * certificate is a PEM-encoded signed certificate.
   */
  certificate?: string;
  /**
   * Current state of the EnrollmentRequest.
   */
  conditions?: Array<EnrollmentRequestCondition>;
  approval?: EnrollmentRequestApproval;
};

