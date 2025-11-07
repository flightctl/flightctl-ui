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
  organizationAssignment: AuthOrganizationAssignment;
  /**
   * JSON path to the username claim in the JWT token as an array of path segments (e.g., ["preferred_username"], ["email"], ["sub"]).
   */
  usernameClaim?: Array<string>;
  roleAssignment: AuthRoleAssignment;
};

