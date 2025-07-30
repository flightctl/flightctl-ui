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
  /**
   * X.509 public certificate for the TPM Endorsement Key (EK), issued by a trusted manufacturer CA.
   */
  ekCertificate?: string;
  /**
   * Base64-encoded TPM2_Certify attestation info for Local Attestation Key (LAK) signed by AK.
   */
  lakCertifyInfo?: string;
  /**
   * Base64-encoded TPM2_Certify signature over LAK attestation info, made by AK.
   */
  lakCertifySignature?: string;
  /**
   * Base64-encoded TPM2_Certify attestation info for Local Device Identity (LDevID) signed by AK.
   */
  ldevidCertifyInfo?: string;
  /**
   * Base64-encoded TPM2_Certify signature over LDevID attestation info, made by AK.
   */
  ldevidCertifySignature?: string;
  /**
   * Base64-encoded DER public key of the Local Attestation Key (LAK).
   */
  lakPublicKey?: string;
  /**
   * Base64-encoded DER public key of the Local Device Identity (LDevID). Must match CSR public key.
   */
  ldevidPublicKey?: string;
  deviceStatus?: DeviceStatus;
  /**
   * A set of labels that the service will apply to this device when its enrollment is approved.
   */
  labels?: Record<string, string>;
};

