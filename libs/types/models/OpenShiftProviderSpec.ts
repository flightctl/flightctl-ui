/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
/**
 * OpenShiftProviderSpec describes an OpenShift OAuth provider configuration.
 */
export type OpenShiftProviderSpec = {
  /**
   * The type of authentication provider.
   */
  providerType: 'openshift';
  /**
   * Human-readable display name for the provider.
   */
  displayName?: string;
  /**
   * The OAuth2 issuer identifier (used for issuer identification in tokens).
   */
  issuer?: string;
  /**
   * The OAuth2 authorization endpoint URL.
   */
  authorizationUrl?: string;
  /**
   * The OAuth2 token endpoint URL.
   */
  tokenUrl?: string;
  /**
   * The OAuth2 client ID.
   */
  clientId?: string;
  /**
   * The OAuth2 client secret.
   */
  clientSecret?: string;
  /**
   * Whether this OpenShift provider is enabled.
   */
  enabled?: boolean;
  /**
   * List of OAuth2 scopes to request.
   */
  scopes?: Array<string>;
  /**
   * The OpenShift cluster control plane URL.
   */
  clusterControlPlaneUrl?: string;
};

