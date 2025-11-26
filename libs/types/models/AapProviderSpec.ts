/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * AapProviderSpec describes an Ansible Automation Platform (AAP) provider configuration.
 */
export type AapProviderSpec = {
  /**
   * The type of authentication provider.
   */
  providerType: 'aap';
  /**
   * Human-readable display name for the provider.
   */
  displayName?: string;
  /**
   * The internal AAP API URL.
   */
  apiUrl: string;
  /**
   * The OAuth2 authorization endpoint URL.
   */
  authorizationUrl: string;
  /**
   * The OAuth2 token endpoint URL.
   */
  tokenUrl: string;
  /**
   * The OAuth2 client ID.
   */
  clientId: string;
  /**
   * The OAuth2 client secret.
   */
  clientSecret: string;
  /**
   * Whether this AAP provider is enabled.
   */
  enabled?: boolean;
  /**
   * List of OAuth2 scopes to request.
   */
  scopes: Array<string>;
};

