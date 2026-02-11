/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ApiVersion } from './ApiVersion';
import type { AuthProvider } from './AuthProvider';
export type AuthConfig = {
  apiVersion: ApiVersion;
  /**
   * List of all available authentication providers.
   */
  providers?: Array<AuthProvider>;
  /**
   * Name of the default authentication provider.
   */
  defaultProvider?: string;
  /**
   * Whether organizations are enabled for authentication.
   */
  organizationsEnabled?: boolean;
};

