/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AuthOrganizationAssignment } from './AuthOrganizationAssignment';
import type { AuthRoleAssignment } from './AuthRoleAssignment';
/**
 * OIDCProviderSpec describes an OIDC provider configuration.
 */
export type OIDCProviderSpec = {
  /**
   * The type of authentication provider.
   */
  providerType: 'oidc';
  /**
   * Human-readable display name for the provider.
   */
  displayName?: string;
  /**
   * The OIDC issuer URL (e.g., https://accounts.google.com).
   */
  issuer: string;
  /**
   * The OIDC client ID.
   */
  clientId: string;
  /**
   * The OIDC client secret.
   */
  clientSecret: string;
  /**
   * Whether this OIDC provider is enabled.
   */
  enabled?: boolean;
  /**
   * List of OIDC scopes to request.
   */
  scopes?: Array<string>;
  /**
   * Space-separated, case-sensitive authorization prompt values, such as login, consent, select_account, none, or provider-specific values. Omitted and null values are preserved in AuthProvider resources and exposed as select_account in public authentication configuration. An empty string instructs clients to omit the prompt parameter. Values must be printable ASCII separated by spaces; none cannot accompany a different value. Accepted values are preserved, including extra spaces and duplicates.
   */
  prompt?: string | null;
  organizationAssignment: AuthOrganizationAssignment;
  /**
   * JSON path to the username claim in the JWT token as an array of path segments (e.g., ["preferred_username"], ["email"], ["sub"]).
   */
  usernameClaim?: Array<string>;
  roleAssignment: AuthRoleAssignment;
};

