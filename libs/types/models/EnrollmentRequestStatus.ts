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
   * Optional tenant-local enrollment credential CSR reference. Consumers must resolve authoritative state before use; absence does not prevent enrollment.
   */
  enrollmentCertificateName?: string;
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

