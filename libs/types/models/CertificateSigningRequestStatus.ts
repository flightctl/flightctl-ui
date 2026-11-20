/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Condition } from './Condition';
import type { EnrollmentCertificateRevocation } from './EnrollmentCertificateRevocation';
/**
 * Indicates approval/denial/failure status of the CSR, and contains the issued certificate if any exists.
 */
export type CertificateSigningRequestStatus = {
  /**
   * Server-owned immutable enrollment credential revocation state.
   */
  readonly revocation?: EnrollmentCertificateRevocation;
  /**
   * Server-owned enrollment certificate publication time, immutable once published and unknown for historical issuance.
   */
  readonly issuedAt?: string;
  /**
   * The issued signed certificate, immutable once populated.
   */
  certificate?: string;
  /**
   * Conditions applied to the request. Known conditions are Approved, Denied, and Failed.
   */
  conditions: Array<Condition>;
};

