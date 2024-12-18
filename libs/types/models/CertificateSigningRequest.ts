/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CertificateSigningRequestSpec } from './CertificateSigningRequestSpec';
import type { CertificateSigningRequestStatus } from './CertificateSigningRequestStatus';
import type { ObjectMeta } from './ObjectMeta';
/**
 * CertificateSigningRequest represents a request for a signed certificate from the CA.
 */
export type CertificateSigningRequest = {
  /**
   * APIVersion defines the versioned schema of this representation of an object. Servers should convert recognized schemas to the latest internal value, and may reject unrecognized values. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#resources.
   */
  apiVersion: string;
  /**
   * Kind is a string value representing the REST resource this object represents. Servers may infer this from the endpoint the client submits requests to. Cannot be updated. In CamelCase. More info: https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#types-kinds.
   */
  kind: string;
  metadata: ObjectMeta;
  spec: CertificateSigningRequestSpec;
  status?: CertificateSigningRequestStatus;
};

