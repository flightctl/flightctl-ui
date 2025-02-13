/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Condition } from './Condition';
/**
 * Indicates approval/denial/failure status of the CSR, and contains the issued certificate if any exists.
 */
export type CertificateSigningRequestStatus = {
  /**
   * The issued signed certificate, immutable once populated.
   */
  certificate?: string;
  /**
   * Conditions applied to the request. Known conditions are Approved, Denied, and Failed.
   */
  conditions: Array<Condition>;
};

