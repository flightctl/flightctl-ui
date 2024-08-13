/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * Wrapper around a user-created CSR, modeled on kubernetes io.k8s.api.certificates.v1.CertificateSigningRequestSpec
 */
export type CertificateSigningRequestSpec = {
  /**
   * Requested duration of validity for the certificate
   */
  expirationSeconds?: number;
  /**
   * Extra attributes of the user that created the CSR, populated by the API server on creation and immutable
   */
  extra?: Record<string, Array<string>>;
  /**
   * The base64-encoded PEM-encoded PKCS#10 CSR. Matches the spec.request field in a kubernetes CertificateSigningRequest resource
   */
  request: string;
  /**
   * Indicates the requested signer, and is a qualified name
   */
  signerName: string;
  /**
   * UID of the user that created the CSR, populated by the API server on creation and immutable
   */
  uid?: string;
  /**
   * Usages specifies a set of key usages requested in the issued certificate.
   */
  usages?: Array<string>;
  /**
   * Name of the user that created the CSR, populated by the API server on creation and immutable
   */
  username?: string;
};

