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
   * The PEM-encoded PKCS#10 certificate signing request.
   */
  csr: string;
  deviceStatus?: DeviceStatus;
  /**
   * A set of labels that the service will apply to this device when its enrollment is approved.
   */
  labels?: Record<string, string>;
};

