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
  /**
   * If specified, only projects with this label will be considered. The label selector should be in the format 'key' or 'key=value'. If only the key is provided, any project with that label (regardless of value) will be included. This enables server-side filtering for better performance.
   */
  projectLabelFilter?: string;
  /**
   * Optional suffix to strip from ClusterRole names when normalizing role names. Used for multi-release deployments where ClusterRoles have namespace-specific names (e.g., flightctl-admin-<namespace>).
   */
  roleSuffix?: string;
};

