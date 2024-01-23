/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DeviceStatus } from './DeviceStatus';
/**
 * EnrollmentRequestSpec is a description of a EnrollmentRequest's target state.
 */
export type EnrollmentRequestSpec = {
  /**
   * csr is a PEM-encoded PKCS#10 certificate signing request.
   */
  csr: string;
  deviceStatus?: DeviceStatus;
};

