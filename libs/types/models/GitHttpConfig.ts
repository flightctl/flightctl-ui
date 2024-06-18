/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type GitHttpConfig = {
  /**
   * The username for auth with HTTP transport
   */
  username?: string;
  /**
   * The password for auth with HTTP transport
   */
  password?: string;
  /**
   * Base64 encoded TLS cert data
   */
  'tls.crt'?: string;
  /**
   * Base64 encoded TLS cert key
   */
  'tls.key'?: string;
  /**
   * Base64 encoded root CA
   */
  'ca.crt'?: string;
  /**
   * Skip remote server verification
   */
  skipServerVerification?: boolean;
};

