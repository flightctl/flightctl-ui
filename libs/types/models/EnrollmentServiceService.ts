/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * EnrollmentServiceService contains information about connecting to a Flight Control enrollment service.
 */
export type EnrollmentServiceService = {
  /**
   * CertificateAuthorityData contains PEM-encoded certificate authority certificates.
   */
  'certificate-authority-data': string;
  /**
   * Server is the address of the Flight Control enrollment service (https://hostname:port).
   */
  server: string;
};

