/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { OciAuth } from './OciAuth';
/**
 * OCI container registry specification.
 */
export type OciRepoSpec = {
  /**
   * The OCI registry hostname, FQDN, or IP address with optional port (e.g., quay.io, registry.redhat.io, myregistry.com:5000, 192.168.1.1:5000, [::1]:5000).
   */
  registry: string;
  /**
   * URL scheme for connecting to the registry.
   */
  scheme?: OciRepoSpec.scheme;
  /**
   * The repository type discriminator.
   */
  type: 'oci';
  /**
   * Access mode for the registry: "Read" for read-only (pull), "ReadWrite" for read-write (pull and push).
   */
  accessMode?: OciRepoSpec.accessMode;
  ociAuth?: OciAuth;
  /**
   * Base64 encoded root CA.
   */
  'ca.crt'?: string;
  /**
   * Skip remote server verification.
   */
  skipServerVerification?: boolean;
};
export namespace OciRepoSpec {
  /**
   * URL scheme for connecting to the registry.
   */
  export enum scheme {
    HTTP = 'http',
    HTTPS = 'https',
  }
  /**
   * Access mode for the registry: "Read" for read-only (pull), "ReadWrite" for read-write (pull and push).
   */
  export enum accessMode {
    READ = 'Read',
    READ_WRITE = 'ReadWrite',
  }
}

